const { AuthenticationError } = require('apollo-server-express');
const { User, Book } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
      me: async (parent, args, context) => {
          if (context.user) {
            return User.findOne({ _id: context.user._id }).populate('books');
          }
          throw new AuthenticationError('You need to be logged in!');
      },    
    },
    Mutation: {
      addUser: async (parent, args ) => {
        const user = await User.create(args);
        const token = signToken(user);
        return { token, user };
      },      
      login: async (parent, { email, password }) => {
        const user = await User.findOne({ email });
  
        if (!user) {
          throw new AuthenticationError('No user found with this email address');
        }
  
        const correctPw = await user.isCorrectPassword(password);
  
        if (!correctPw) {
          throw new AuthenticationError('Incorrect credentials');
        }
  
        const token = signToken(user);
  
        return { token, user };
      },
      saveBook: async (parent, args, context) => {
        if (context.user) {
          return await User.findOneAndUpdate(
            { _id: context.user._id},
            { $push: { savedBooks: args.input }},
            {
              new: true              
            }            
          ); 
        }
        throw new AuthenticationError('You need to be logged in!');
      },
      removeBook: async (parent, args, context) => {
        if (context.user) {
          return await User.findByIdAndUpdate(
            { _id: context.user._id },
            { $pull: { savedBooks: { bookId: args.bookId } } },
            { new: true }
          );
        }
        throw new AuthenticationError('You need to be logged in!');
      }
    },
};

module.exports = resolvers;
