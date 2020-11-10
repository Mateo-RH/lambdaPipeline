import React, { Component } from 'react';
import classes from './Person.css';
import Aux from '../../../hoc/Auxilliary';
import withClass from '../../../hoc/withClass';
import AuthContext from '../../../context/auth-context';

class Person extends Component {
  constructor(props) {
    super(props);
    this.inputElementRef = React.createRef();
  }

  static contextType = AuthContext;

  componentDidMount() {
    // this.inputElement.focus();
    this.inputElementRef.current.focus();
  }

  render() {
    console.log('[Person.js] rendering...');
    return (
      <Aux>
        {this.context.authenticated ? (
          <p>Is Authenticated!</p>
        ) : (
          <p>Please Log In</p>
        )}
        <p onClick={this.props.click}>
          I'm {this.props.name} and i am {this.props.age} years old!
        </p>
        <p>{this.props.children}</p>
        <input
          onChange={this.props.change}
          value={this.props.name}
          ref={this.inputElementRef}
          // ref={(inputEl) => {
          //   this.inputElement = inputEl;
          // }}
        ></input>
      </Aux>
    );
  }
}

export default withClass(Person, classes.Person);
