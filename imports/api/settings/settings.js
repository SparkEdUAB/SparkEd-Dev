import { Mongo } from 'meteor/mongo';

export const _Settings = new Mongo.Collection('settings');

_Settings.deny({
  insert: () => true,
  update: () => true,
  remove: () => true,
});

