exports.up = async knex => {
  return knex.schema.createTable('tokens', table => {
    table
      .increments('id')
      .unsigned()
      .notNullable()
      .primary(['token_id_pkey']);
    table.string('token', 100).notNullable();
    table
      .timestamp('created_at')
      .notNullable()
      .defaultTo(knex.fn.now());
    table
      .timestamp('updated_at')
      .notNullable()
      .defaultTo(knex.fn.now());
    table.boolean('isValid').defaultTo(true);
    table.string('userId', 100).notNullable();
    table.unique('token');
  });
};

exports.down = async knex => {
  return knex.schema.dropTable('tokens');
};
