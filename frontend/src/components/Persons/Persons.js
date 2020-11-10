import React, { PureComponent } from 'react';
import Person from './Person/Person';

class Persons extends PureComponent {
  static getDerivedStatusFromProps(props, state) {
    console.log('[Persons.js] getDerivedStateFromProps');
    return state;
  }

  // shouldComponentUpdate(nextProps, nextState) {
  //   console.log('[Persons.js] shouldComponentUpdate');
  //   return (
  //     nextProps.persons !== this.props.persons ||
  //     nextProps.change !== this.props.change ||
  //     nextProps.click !== this.props.click
  //   );
  // }

  getSnapshotBeforeUpdate(prevProps, prevState) {
    console.log('[Persons.js] getSnapshotBeforeUpdate');
    return { message: 'snapshot' };
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    console.log('[Persons.js] componentDidUpdate');
    console.log(snapshot);
  }

  componentWillUnmount() {
    console.log('[Persons.js] componentWillUnmount');
  }

  render() {
    console.log('[Persons.js] rendering...');
    return this.props.persons.map((person, i) => {
      return (
        <Person
          key={person.id}
          name={person.name}
          age={person.age}
          click={() => this.props.click(i)}
          change={(event) => this.props.change(event, person.id)}
        />
      );
    });
  }
}

export default Persons;
