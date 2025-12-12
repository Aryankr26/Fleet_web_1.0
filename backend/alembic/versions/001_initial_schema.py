"""initial schema

Revision ID: 001_initial
Revises: 
Create Date: 2025-12-12 13:45:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '001_initial'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create telemetry_raw table
    op.create_table(
        'telemetry_raw',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('imei', sa.String(length=255), nullable=False),
        sa.Column('lat', sa.Float(), nullable=False),
        sa.Column('lon', sa.Float(), nullable=False),
        sa.Column('speed', sa.Float(), nullable=True),
        sa.Column('ignition', sa.Boolean(), nullable=True),
        sa.Column('fuel', sa.Float(), nullable=True),
        sa.Column('timestamp', sa.BigInteger(), nullable=False),
        sa.Column('raw_json', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_telemetry_imei', 'telemetry_raw', ['imei'])
    op.create_index('idx_telemetry_timestamp', 'telemetry_raw', ['timestamp'])

    # Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('username', sa.String(length=255), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('role', sa.String(length=50), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('username'),
        sa.UniqueConstraint('email')
    )

    # Create vehicles table
    op.create_table(
        'vehicles',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('imei', sa.String(length=255), nullable=False),
        sa.Column('registration_number', sa.String(length=50), nullable=False),
        sa.Column('manufacturer', sa.String(length=100), nullable=True),
        sa.Column('model', sa.String(length=100), nullable=True),
        sa.Column('year', sa.Integer(), nullable=True),
        sa.Column('fuel_type', sa.String(length=50), nullable=True),
        sa.Column('status', sa.String(length=50), server_default='active', nullable=False),
        sa.Column('owner_id', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('imei'),
        sa.UniqueConstraint('registration_number'),
        sa.ForeignKeyConstraint(['owner_id'], ['users.id'], ondelete='SET NULL')
    )
    op.create_index('idx_vehicles_imei', 'vehicles', ['imei'])
    op.create_index('idx_vehicles_owner', 'vehicles', ['owner_id'])

    # Create geofences table
    op.create_table(
        'geofences',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('category', sa.String(length=100), nullable=True),
        sa.Column('geometry', sa.JSON(), nullable=False),
        sa.Column('time_window_start', sa.Time(), nullable=True),
        sa.Column('time_window_end', sa.Time(), nullable=True),
        sa.Column('active', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('created_by', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], ondelete='SET NULL')
    )
    op.create_index('idx_geofences_active', 'geofences', ['active'])

    # Create alerts table
    op.create_table(
        'alerts',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('vehicle_id', sa.Integer(), nullable=True),
        sa.Column('geofence_id', sa.Integer(), nullable=True),
        sa.Column('alert_type', sa.String(length=100), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('severity', sa.String(length=50), server_default='info', nullable=False),
        sa.Column('acknowledged', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['vehicle_id'], ['vehicles.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['geofence_id'], ['geofences.id'], ondelete='SET NULL')
    )
    op.create_index('idx_alerts_vehicle', 'alerts', ['vehicle_id'])
    op.create_index('idx_alerts_created', 'alerts', ['created_at'])


def downgrade() -> None:
    op.drop_index('idx_alerts_created', table_name='alerts')
    op.drop_index('idx_alerts_vehicle', table_name='alerts')
    op.drop_table('alerts')
    
    op.drop_index('idx_geofences_active', table_name='geofences')
    op.drop_table('geofences')
    
    op.drop_index('idx_vehicles_owner', table_name='vehicles')
    op.drop_index('idx_vehicles_imei', table_name='vehicles')
    op.drop_table('vehicles')
    
    op.drop_table('users')
    
    op.drop_index('idx_telemetry_timestamp', table_name='telemetry_raw')
    op.drop_index('idx_telemetry_imei', table_name='telemetry_raw')
    op.drop_table('telemetry_raw')
