"use strict";

const fs = require("fs");
const path = require("path");
const { makeExecutableSchema } = require("graphql-tools");
const _ = require("lodash");

const SYMBOL_SCHEMA = Symbol("Applicaton#schema");
const util = require("./util");

module.exports = app => {
  const basePath = path.join(app.baseDir, "app/graphql");
  const types = util.walk(basePath, basePath);

  const schemas = [];
  const resolverMap = {};
  const resolverFactories = [];
  const directiveMap = {};
  const schemaDirectivesProps = {};
  const { defaultEmptySchema = false } = app.config.graphql;
  const defaultSchema = `
    type Query 
    type Mutation 
  `;
  if (defaultEmptySchema) {
    schemas.push(defaultSchema);
  }
  types.forEach(type => {
    const currentDir = path.join(basePath, type);

    // Load schema
    const schemaFile = path.join(basePath, type, "schema.graphql");
    /* istanbul ignore else */
    if (fs.existsSync(schemaFile)) {
      const schema = fs.readFileSync(schemaFile, {
        encoding: "utf8"
      });
      schemas.push(schema);
    }

    // Load resolver
    const resolver = util.fileLoader(currentDir, "resolver");
    if (resolver) {
      if (_.isFunction(resolver)) {
        resolverFactories.push(resolver);
      } else if (_.isObject(resolver)) {
        _.merge(resolverMap, resolver);
      }
    }

    // Load directive resolver
    const directive = util.fileLoader(currentDir, "directive");
    if (directive) {
      _.merge(directiveMap, directive);
    }

    // Load schemaDirectives
    const schemaDirectives = util.fileLoader(currentDir, "schemaDirective");
    if (schemaDirectives) {
      _.merge(schemaDirectivesProps, schemaDirectivesFile);
    }
  });

  Object.defineProperty(app, "schema", {
    get() {
      if (!this[SYMBOL_SCHEMA]) {
        resolverFactories.forEach(resolverFactory =>
          _.merge(resolverMap, resolverFactory(app))
        );

        this[SYMBOL_SCHEMA] = makeExecutableSchema({
          typeDefs: schemas,
          resolvers: resolverMap,
          directiveResolvers: directiveMap,
          schemaDirectives: schemaDirectivesProps
        });
      }
      return this[SYMBOL_SCHEMA];
    }
  });
};
