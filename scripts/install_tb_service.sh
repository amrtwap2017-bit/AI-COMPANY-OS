#!/bin/bash
# Install TB Admin as systemd service
# Run: sudo bash scripts/install_tb_service.sh

echo "Installing TB Admin systemd service..."
sudo cp /home/amr/AI-COMPANY-OS/scripts/tb-admin.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable tb-admin
sudo systemctl start tb-admin
echo "Done. Check: sudo systemctl status tb-admin"
