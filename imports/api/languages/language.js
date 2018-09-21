import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';


export const Language = new Mongo.Collection('language');

const Schema = {};

Schema.language = new SimpleSchema({
  language: String,
});

Language.attachSchema(Schema.language);
