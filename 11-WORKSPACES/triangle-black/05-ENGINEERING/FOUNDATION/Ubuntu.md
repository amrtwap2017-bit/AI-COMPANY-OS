# Ubuntu LTS Server Setup

## Overview

Baseline server hardening for Ubuntu 22.04 LTS (Jammy Jellyfish). Applied once on initial provisioning and verified periodically.

## 1. Initial Provisioning

### 1.1 Update System

```bash
sudo apt update && sudo apt upgrade -y
sudo apt autoremove -y
```

### 1.2 Set Hostname

```bash
sudo hostnamectl set-hostname tb-app-01
echo "127.0.1.1 tb-app-01" | sudo tee -a /etc/hosts
```

### 1.3 Timezone

```bash
sudo timedatectl set-timezone Africa/Cairo
```

## 2. User Accounts

### 2.1 Create Deploy User

```bash
sudo adduser deploy
sudo usermod -aG sudo deploy
```

### 2.2 Add SSH Key

```bash
sudo mkdir -p /home/deploy/.ssh
sudo chmod 700 /home/deploy/.ssh
echo "ssh-ed25519 AAAAC3... your-key-here" | sudo tee /home/deploy/.ssh/authorized_keys
sudo chmod 600 /home/deploy/.ssh/authorized_keys
sudo chown -R deploy:deploy /home/deploy/.ssh
```

### 2.3 Restrict Root Login

Root SSH login disabled (see SSH Hardening below). All administration via `deploy` user with `sudo`.

## 3. SSH Hardening

Edit `/etc/ssh/sshd_config`:

```bash
# Disable root login
PermitRootLogin no

# Key-only authentication
PasswordAuthentication no
PubkeyAuthentication yes
ChallengeResponseAuthentication no

# Use ed25519 keys only
HostKey /etc/ssh/ssh_host_ed25519_key

# Limit users
AllowUsers deploy

# Rate limiting
MaxAuthTries 3
MaxSessions 5

# Disable X11 forwarding
X11Forwarding no

# Idle timeout
ClientAliveInterval 300
ClientAliveCountMax 2

# Protocol
Protocol 2
```

Apply:

```bash
sudo systemctl restart sshd
```

## 4. Firewall (UFW)

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw enable
```

Verify:

```bash
sudo ufw status verbose
```

Expected output:

```
Status: active
Logging: on (low)
Default: deny (incoming), allow (outgoing)
New profiles: skip

To                         Action      From
--                         ------      ----
22/tcp                     ALLOW IN    Anywhere
80/tcp                     ALLOW IN    Anywhere
443/tcp                    ALLOW IN    Anywhere
```

## 5. Fail2ban

```bash
sudo apt install fail2ban -y
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
```

Edit `/etc/fail2ban/jail.local`:

```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5
destemail = admin@triangleblack.com
action = %(action_mwl)s

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
```

Enable and start:

```bash
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

Verify:

```bash
sudo fail2ban-client status sshd
```

## 6. Automatic Security Updates

```bash
sudo apt install unattended-upgrades apt-listchanges -y
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

Edit `/etc/apt/apt.conf.d/50unattended-upgrades`:

```ini
Unattended-Upgrade::Allowed-Origins {
    "${distro_id}:${distro_codename}";
    "${distro_id}:${distro_codename}-security";
    "${distro_id}ESMApps:${distro_codename}-apps-security";
    "${distro_id}ESM:${distro_codename}-infra-security";
};
Unattended-Upgrade::AutoFixInterruptedDpkg "true";
Unattended-Upgrade::MinimalSteps "true";
Unattended-Upgrade::Remove-Unused-Kernel-Packages "true";
Unattended-Upgrade::Remove-New-Unused-Dependencies "true";
Unattended-Upgrade::Automatic-Reboot "false";
Unattended-Upgrade::Automatic-Reboot-Time "03:00";
```

Enable automatic updates:

```bash
sudo systemctl enable unattended-upgrades
sudo systemctl start unattended-upgrades
```

## 7. Kernel Hardening (sysctl)

Edit `/etc/sysctl.d/99-hardening.conf`:

```ini
# IP Spoofing protection
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.default.rp_filter = 1

# Ignore ICMP redirects
net.ipv4.conf.all.accept_redirects = 0
net.ipv6.conf.all.accept_redirects = 0
net.ipv4.conf.all.send_redirects = 0

# Ignore source-routed packets
net.ipv4.conf.all.accept_source_route = 0
net.ipv6.conf.all.accept_source_route = 0

# SYN flood protection
net.ipv4.tcp_syncookies = 1

# Disable IPv6 if not needed
# net.ipv6.conf.all.disable_ipv6 = 1
# net.ipv6.conf.default.disable_ipv6 = 1
```

Apply:

```bash
sudo sysctl -p /etc/sysctl.d/99-hardening.conf
```

## 8. Docker Installation

```bash
# Install prerequisites
sudo apt install ca-certificates curl gnupg lsb-release -y

# Add Docker GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
  sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Add repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io docker-compose-plugin -y

# Add deploy user to docker group
sudo usermod -aG docker deploy
```

## 9. Verification Checklist

| Check | Command | Expected |
|-------|---------|----------|
| SSH key only | `ssh -o PasswordAuthentication=no deploy@host` | Connects without password prompt |
| Root login blocked | `ssh root@host` | Connection refused or denied |
| UFW active | `sudo ufw status` | Status: active |
| Fail2ban running | `sudo systemctl is-active fail2ban` | active |
| Unattended upgrades | `sudo systemctl is-active unattended-upgrades` | active |
| Docker running | `sudo systemctl is-active docker` | active |
| deploy user | `id deploy` | uid=1001(deploy) gid=1001(deploy) groups=1001(deploy),27(sudo),999(docker) |

## 10. Maintenance

| Task | Frequency | Command |
|------|-----------|---------|
| Apply updates | Monthly | `sudo apt update && sudo apt upgrade -y` |
| Check fail2ban status | Weekly | `sudo fail2ban-client status sshd` |
| Review auth log | Weekly | `sudo tail -100 /var/log/auth.log` |
| Review unattended-upgrades log | Monthly | `sudo tail -50 /var/log/unattended-upgrades/unattended-upgrades.log` |
| Rotate SSH keys | Annual | Generate new key, update authorized_keys, remove old |
