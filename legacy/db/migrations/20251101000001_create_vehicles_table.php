<?php

use Phinx\Migration\AbstractMigration;

class CreateVehiclesTable extends AbstractMigration
{
    public function change()
    {
        $table = $this->table('vehicles', [
            'id' => false,
            'primary_key' => ['id'],
            'engine' => 'InnoDB',
            'encoding' => 'utf8mb4',
            'collation' => 'utf8mb4_unicode_ci',
            'comment' => 'Client vehicle information'
        ]);

        $table->addColumn('id', 'integer', ['identity' => true, 'signed' => false])
            ->addColumn('client_id', 'integer', ['signed' => false, 'null' => false])
            ->addColumn('make', 'string', ['limit' => 50, 'null' => false])
            ->addColumn('model', 'string', ['limit' => 50, 'null' => false])
            ->addColumn('year', 'integer', ['signed' => false, 'null' => true])
            ->addColumn('registration', 'string', ['limit' => 50, 'null' => false])
            ->addColumn('color', 'string', ['limit' => 30, 'null' => true])
            ->addColumn('vin', 'string', ['limit' => 50, 'null' => true])
            ->addColumn('engine_size', 'string', ['limit' => 20, 'null' => true])
            ->addColumn('fuel_type', 'string', ['limit' => 20, 'null' => true])
            ->addColumn('mileage', 'integer', ['signed' => false, 'null' => true])
            ->addColumn('notes', 'text', ['null' => true])
            ->addColumn('created_at', 'timestamp', ['default' => 'CURRENT_TIMESTAMP', 'null' => false])
            ->addColumn('updated_at', 'timestamp', ['default' => 'CURRENT_TIMESTAMP', 'update' => 'CURRENT_TIMESTAMP', 'null' => false])
            ->addForeignKey('client_id', 'clients', 'id', ['delete' => 'CASCADE', 'update' => 'CASCADE'])
            ->addIndex(['client_id'], ['name' => 'idx_client_id'])
            ->addIndex(['registration'], ['name' => 'idx_registration'])
            ->addIndex(['client_id', 'registration'], ['unique' => true, 'name' => 'unique_registration_per_client'])
            ->create();
    }

    public function down()
    {
        $this->table('vehicles')->drop()->save();
    }
}

