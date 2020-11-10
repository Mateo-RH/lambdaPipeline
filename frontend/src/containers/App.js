import React, { Component } from 'react';
import classes from './App.css';
import Persons from '../components/Persons/Persons';
import Cockpit from '../components/Cockpit/Cockpit';
import withClass from '../hoc/withClass';
import Aux from '../hoc/Auxilliary';
import AuthContext from '../context/auth-context';

class App extends Component {
  constructor(props) {
    super(props);
    console.log('[App.js] constructor');
  }

  state = {
    persons: [
      { id: 'asd', name: 'Max', age: 20 },
      { id: 'qwe', name: 'Manu', age: 21 },
      { id: 'zxc', name: 'Alex', age: 22 },
    ],
    showPersons: false,
    showCockpit: true,
    changeCounter: 0,
    authenticated: false,
  };

  static getDerivedStateFromProps(props, state) {
    console.log('[App.js] getDerivedStateFromProps', props);
    return state;
  }

  componentDidMount() {
    console.log('[App.js] componentDidMout');
  }

  shouldComponentUpdate(nextProps, nextState) {
    console.log('[App.js] shouldComponentUpdate');
    return true;
  }

  componentDidUpdate() {
    console.log('[App.js] componentDidUpdate');
  }

  togglePersonsHanlder = () => {
    this.setState({ showPersons: !this.state.showPersons });
  };

  deletePersonHandler = (personIndex) => {
    const persons = [...this.state.persons];
    persons.splice(personIndex, 1);
    this.setState({ persons });
  };

  changeNameHandler = (event, personId) => {
    const personIndex = this.state.persons.findIndex((p) => p.id === personId);
    const person = { ...this.state.persons[personIndex] };
    person.name = event.target.value;
    const persons = [...this.state.persons];
    persons[personIndex] = person;
    this.setState((prevState, props) => {
      return { persons, changeCounter: prevState.changeCounter + 1 };
    });
  };

  loginHandler = () => {
    this.setState({ authenticated: true });
  };

  render() {
    console.log('[App.js] render');
    let persons = this.state.showPersons ? (
      <Persons
        persons={this.state.persons}
        click={this.deletePersonHandler}
        change={this.changeNameHandler}
        isAuthenticated={this.state.authenticated}
      />
    ) : null;

    return (
      // React.createElement('div',{ className: 'App' },React.createElement('h1', null, "Hi, I'm a React App") )
      <Aux>
        <button
          onClick={() => {
            this.setState({ showCockpit: false });
          }}
        >
          Remove cockpit
        </button>
        <AuthContext.Provider
          value={{
            authenticated: this.state.authenticated,
            login: this.loginHandler,
          }}
        >
          {this.state.showCockpit && (
            <Cockpit
              title={this.props.appTitle}
              showPersons={this.state.showPersons}
              personsLength={this.state.persons.length}
              click={this.togglePersonsHanlder}
            />
          )}
          {persons}
        </AuthContext.Provider>
      </Aux>
    );
  }
}

export default withClass(App, classes.App);

// Updating state inmutably
// Use key for indexing lists
// Render conditioal content troguht variables
// css modules -> separate css from js but allows you to scope styles
