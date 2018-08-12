import React from 'react';
import PropTypes from 'prop-types';

export const Button = ({
  actionFunc, title, backgroundColor, name, extraClass,
}) => (
  <button
    className={`btn waves-effect waves-light center ${extraClass}`}
    role="submit"
    onClick={actionFunc}
    title={title}
    style={{ backgroundColor }}
  >
    {name}
  </button>
);

Button.propTypes = {
  actionFunc: PropTypes.func,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  backgroundColor: PropTypes.string.isRequired,
  name: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  extraClass: PropTypes.string,
};
