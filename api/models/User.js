/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {
    username: {
      type: "string",
      required: true,
      unique: true,
      minLength: 3
    },
    password: {
      type: "string"
    },
    email: {
      type: "email",
      required: true,
      unique: true
    },
    phone: {
      type: "string",
      required: false
    },
    nickname: {
      type: "string",
      required: false
    }
  }
};

