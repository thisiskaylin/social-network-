import React, { Fragment, useState } from 'react';
import { connect } from 'react-redux'; //work with redux
import { Link } from 'react-router-dom';
import { setAlert } from '../../actions/alert';
import PropTypes from 'prop-types'; //hotket impt

const Register = ({ setAlert }) => { //setalert action
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password2: ''
  });

  const {name, email, password, password2} = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    if(password !== password2) {
      //pass this in as message to our action/alert.js
      setAlert('Password do not match', 'danger'); 
    } else {
      console.log('SUCCESS');
    }
  };
  
  return <Fragment>
    <section className='container'>
      <h1 className="large text-primary">Sign Up</h1>
      <p className="lead">
        <i className="fas fa-user"></i> Create Your Account
      </p>
      <form className="form" onSubmit={onSubmit}>
        <div className="form-group">
          <input 
            type="text" 
            placeholder="Name" 
            name="name" 
            value={name} 
            onChange={onChange}
            required />
        </div>
        <div className="form-group">
          <input 
            type="email" 
            placeholder="Email Address"
            name="email" 
            value={email} 
            onChange={onChange}
            required/>
          <small className="form-text">
            This site uses Gravatar so if you want a profile image, use a
            Gravatar email
          </small>
        </div>
        <div className="form-group">
          <input
            type="password"
            placeholder="Password"
            name="password"
            value={password} 
            onChange={onChange}
            minLength="6"
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            placeholder="Confirm Password"
            name="password2"
            value={password2} 
            onChange={onChange}
            minLength="6"
          />
        </div>
        <input type="submit" className="btn btn-primary" value="Register" />
      </form>
      <p className="my-1">
        Already have an account? <Link to="/login">Sign In</Link>
      </p>
    </section>
  </Fragment>;
};

Register.propTypes = {
  setAlert: PropTypes.func.isRequired
};

//connect takes two things, first is the state you want to map,
//second is object with any action you want to use, which allows us to use props
export default connect(null, { setAlert })(Register);