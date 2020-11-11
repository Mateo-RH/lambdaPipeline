import * as codebuild from '@aws-cdk/aws-codebuild';
import * as codepipeline from '@aws-cdk/aws-codepipeline';
import * as codepipeline_actions from '@aws-cdk/aws-codepipeline-actions';
import * as lambda from '@aws-cdk/aws-lambda';
import * as s3 from '@aws-cdk/aws-s3';
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import {
  App,
  Stack,
  StackProps,
  SecretValue,
  RemovalPolicy,
} from '@aws-cdk/core';

export interface PipelineStackProps extends StackProps {
  readonly lambdaCode: lambda.CfnParametersCode;
  readonly githubToken: string;
  readonly dev_cognito_id: string;
  readonly prod_cognito_id: string;
}

export class PipelineStack extends Stack {
  constructor(app: App, id: string, props: PipelineStackProps) {
    super(app, id, props);

    const cdkBuild = new codebuild.PipelineProject(this, 'CdkBuild', {
      buildSpec: codebuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          install: {
            commands: 'npm install',
          },
          build: {
            commands: ['npm run build', 'npm run cdk synth -- -o dist'],
          },
        },
        artifacts: {
          'base-directory': 'dist',
          files: ['LambdaStack.template.json'],
        },
      }),
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_2_0,
      },
    });
    const lambdaBuild = new codebuild.PipelineProject(this, 'LambdaBuild', {
      buildSpec: codebuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          install: {
            commands: ['cd lambda', 'npm install'],
          },
          build: {
            commands: 'npm run build',
          },
        },
        artifacts: {
          'base-directory': 'lambda',
          files: ['index.js', 'node_modules/**/*'],
        },
      }),
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_2_0,
      },
    });
    const reactBuild = new codebuild.PipelineProject(this, 'ReactBuild', {
      buildSpec: codebuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          install: {
            // commands: [
            //   'cd frontend',
            //   `sed -i 's+http://localhost:3000/+https://contracts.artifik.no/+g' src/aws-pool.js`,
            //   `sed -i "s+${props.dev_cognito_id}+${props.prod_cognito_id}+g" src/aws-pool.js`,
            //   'npm install',
            // ],
            commands: ['cd frontend', 'npm install'],
          },
          build: {
            commands: 'npm run build',
          },
        },
        artifacts: {
          'base-directory': 'frontend/build',
          files: ['**/*'],
          'discard-paths': 'no',
        },
      }),
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_2_0,
      },
    });

    // Artifacts
    const sourceOutput = new codepipeline.Artifact();
    const cdkBuildOutput = new codepipeline.Artifact('CdkBuildOutput');
    const lambdaBuildOutput = new codepipeline.Artifact('LambdaBuildOutput');
    const reactBuildOutput = new codepipeline.Artifact('ReactAppOutput');

    // S3;
    // TODO: Setup access only from cf
    const targetBucket = new s3.Bucket(this, 'ReactAppBucket', {
      publicReadAccess: true,
      removalPolicy: RemovalPolicy.DESTROY,
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html',
    });
    new cloudfront.CloudFrontWebDistribution(this, 'CDKCRAStaticDistribution', {
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: targetBucket,
          },
          behaviors: [{ isDefaultBehavior: true }],
        },
      ],
    });

    new codepipeline.Pipeline(this, 'Pipeline', {
      stages: [
        {
          stageName: 'Source',
          actions: [
            new codepipeline_actions.GitHubSourceAction({
              actionName: 'CodeCommit_Source',
              output: sourceOutput,
              owner: 'Mateo-RH',
              repo: 'lambdaPipeline',
              branch: 'main',
              oauthToken: SecretValue.secretsManager(props.githubToken),
              trigger: codepipeline_actions.GitHubTrigger.WEBHOOK,
            }),
          ],
        },
        {
          stageName: 'Build',
          actions: [
            new codepipeline_actions.CodeBuildAction({
              actionName: 'Lambda_Build',
              project: lambdaBuild,
              input: sourceOutput,
              outputs: [lambdaBuildOutput],
            }),
            new codepipeline_actions.CodeBuildAction({
              actionName: 'React_Build',
              project: reactBuild,
              input: sourceOutput,
              outputs: [reactBuildOutput],
            }),
            new codepipeline_actions.CodeBuildAction({
              actionName: 'CDK_Build',
              project: cdkBuild,
              input: sourceOutput,
              outputs: [cdkBuildOutput],
            }),
          ],
        },
        {
          stageName: 'Deploy',
          actions: [
            new codepipeline_actions.CloudFormationCreateUpdateStackAction({
              actionName: 'Lambda_CFN_Deploy',
              templatePath: cdkBuildOutput.atPath('LambdaStack.template.json'),
              stackName: 'LambdaDeploymentStack',
              adminPermissions: true,
              parameterOverrides: {
                ...props.lambdaCode.assign(lambdaBuildOutput.s3Location),
              },
              extraInputs: [lambdaBuildOutput],
            }),
            new codepipeline_actions.S3DeployAction({
              actionName: 'React_Deploy',
              bucket: targetBucket,
              input: reactBuildOutput,
            }),
          ],
        },
      ],
    });
  }
}
