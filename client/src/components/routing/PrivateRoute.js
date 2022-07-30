import React from 'react';
import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

const PrivateRoute = ({
  component: Component,
  auth: { isAuthenticated, loading }
}) => {
  // if not authenticated and its not loading, then redirect to login page, else load component that is passed in
  //   if (loading) return <Spinner />;
  if (loading) return <h1>Loading...</h1>;
  if (isAuthenticated) return <Component />;
  
  return <Navigate to='/login' />;
};

PrivateRoute.propTypes = {
  auth: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
});

export default connect(mapStateToProps)(PrivateRoute);

//racfp