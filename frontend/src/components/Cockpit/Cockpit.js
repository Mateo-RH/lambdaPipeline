import React, { useContext, useEffect, useRef } from 'react';
import classes from './Cockpit.css';
import AuthContext from '../../context/auth-context';

const cockpit = (props) => {
  const toggleBtnRef = useRef(null);
  const authContext = useContext(AuthContext);

  useEffect(() => {
    console.log('[Cockpit.js] useEffect');
    // const timer = setTimeout(() => {
    //   alert('Saved data to cloud!');
    // }, 1000);
    toggleBtnRef.current.click();
    return () => {
      console.log('[Cockpit.js] cleanup in useEffect');
    };
  }, []);

  useEffect(() => {
    console.log('[Cockpit.js] 2nd useEffect');
    // runs beffore main useEffect but after first render cycle
    return () => {
      console.log('[Cockpit.js] cleanup in 2nd useEffect');
    };
  });

  let btnClass = props.showPersons ? classes.Red : '';
  const styles = [];
  if (props.personsLength <= 2) styles.push(classes.red);
  if (props.personsLength <= 1) styles.push(classes.bold);

  return (
    <div className={classes.Cockpit}>
      <h1>{props.title}</h1>
      <p className={styles.join(' ')}>This is really working.</p>
      <button className={btnClass} ref={toggleBtnRef} onClick={props.click}>
        Toggle persons
      </button>
      <button onClick={authContext.login}>Log In</button>
    </div>
  );
};

export default React.memo(cockpit);
// export default cockpit;
