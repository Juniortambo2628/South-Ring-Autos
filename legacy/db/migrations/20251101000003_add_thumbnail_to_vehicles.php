<?php

use Phinx\Migration\AbstractMigration;

class AddThumbnailToVehicles extends AbstractMigration
{
    public function change()
    {
        $table = $this->table('vehicles');
        
        // Check if column already exists
        if ($table->hasColumn('thumbnail')) {
            return;
        }
        
        $table->addColumn('thumbnail', 'string', ['limit' => 255, 'null' => true, 'after' => 'mileage'])
            ->update();
    }

    public function down()
    {
        $table = $this->table('vehicles');
        if ($table->hasColumn('thumbnail')) {
            $table->removeColumn('thumbnail')->save();
        }
    }
}

