
#! /bin/bash
#	Copyright 2017, Google, Inc.
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# [START startup]
set -v

# Talk to the metadata server to get the project id
PROJECTID=$(curl -s "http://metadata.google.internal/computeMetadata/v1/project/project-id" -H "Metadata-Flavor: Google")

# Install logging monitor. The monitor will automatically pick up logs sent to
# syslog.
# [START logging]
curl -s "https://storage.googleapis.com/signals-agents/logging/google-fluentd-install.sh" | bash
service google-fluentd restart &
# [END logging]

echo "Updating system."

# Install dependencies from apt
apt-get update
apt-get install -yq ca-certificates git nodejs build-essential

# Install nodejs
mkdir /opt/nodejs
curl https://nodejs.org/dist/v8.1.4/node-v8.1.4-linux-x64.tar.gz | tar xvzf - -C /opt/nodejs --strip-components=1
ln -s /opt/nodejs/bin/node /usr/bin/node
ln -s /opt/nodejs/bin/npm /usr/bin/npm

npm i -g pm2

# Get the application source code from the Google Cloud Repository.
# git requires $HOME and it's not set during the startup script.
export HOME=/root
git config --global credential.helper gcloud.sh
git clone https://github.com/advanced-rest-client/echo-advancedrestclient-com.git /opt/echo-app

# Create a nodeapp user. The application will run as this user.
useradd -m -d /home/nodeapp nodeapp
chown -R nodeapp:nodeapp /opt/echo-app

# Install app dependencies
cd /opt/echo-app
su nodeapp -c "npm install"
su nodeapp -c "bower install"

iptables -t mangle -A PREROUTING -p tcp --dport 80 -j MARK --set-mark 1
iptables -t mangle -A PREROUTING -p tcp --dport 443 -j MARK --set-mark 1
iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 8080
iptables -t nat -A PREROUTING -p tcp --dport 443 -j REDIRECT --to-port 8181
iptables -I INPUT -m state --state NEW -m tcp -p tcp --dport 8080 -m mark --mark 1 -j ACCEPT
iptables -I INPUT -m state --state NEW -m tcp -p tcp --dport 8181 -m mark --mark 1 -j ACCEPT

su nodeapp -c "pm2 start pm2.json --env production"
# Application should now be running under supervisor
# [END startup]
