<?php

use Phinx\Migration\AbstractMigration;

class AddVehicleIdToBookings extends AbstractMigration
{
    public function change()
    {
        $table = $this->table('bookings');
        
        // Check if column already exists
        if ($table->hasColumn('vehicle_id')) {
            return;
        }
        
        $table->addColumn('vehicle_id', 'integer', ['signed' => false, 'null' => true, 'after' => 'client_id'])
            ->addForeignKey('vehicle_id', 'vehicles', 'id', ['delete' => 'SET_NULL', 'update' => 'CASCADE'])
            ->addIndex(['vehicle_id'], ['name' => 'idx_vehicle_id'])
            ->update();
    }

    public function down()
    {
        $table = $this->table('bookings');
        if ($table->hasColumn('vehicle_id')) {
            $table->removeForeignKey('vehicle_id')
                ->removeColumn('vehicle_id')
                ->save();
        }
    }
}

