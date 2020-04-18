'use strict';

exports.up = async knex => {
  await knex.schema.createTable('authors', table => {
    table.increments('id').primary();
    table.string('name');
    table.string('email');
    table.unique(['email']);
  });

  await knex.schema.createTable('package_info', table => {
    table.increments('id').primary();

    table.string('title');
    table.text('description');
    table.dateTime('publication');
  });

  await knex.schema.createTable('packages', table => {
    table.increments('id').primary();
    table.string('package');
    table.string('version');
    table.string('search_name');
    table
      .integer('package_info_id')
      .unsigned()
      .references('id')
      .inTable('package_info')
      .onDelete('SET NULL')
      .index();
  });

  await knex.schema.createTable('package_authors', table => {
    table.increments('id').primary();
    table.string('type');
    table
      .integer('package_info_id')
      .unsigned()
      .references('id')
      .inTable('package_info')
      .onDelete('CASCADE')
      .index();
    table
      .integer('author_id')
      .unsigned()
      .references('id')
      .inTable('authors')
      .onDelete('CASCADE')
      .index();
  });
};

exports.down = async knex => {
  await knex.schema.dropTableIfExists('packages');
  await knex.schema.dropTableIfExists('package_authors');
  await knex.schema.dropTableIfExists('authors');
  await knex.schema.dropTableIfExists('package_info');
};
