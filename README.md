# Infrastructure

The site is hosted as a droplet on [DigitalOcean](https://cloud.digitalocean.com).

using this plan:
- $  5 /mo
- $0.007 /hour
- 512 MB / 1 CPU
- 20 GB SSD disk
- 1000 GB transfer
- with weekly backups, $6/month

## setting up
chose ditribution nUbuntu 16.04.3 x64
- NY datacenter3
- Droplet Name: ubuntu-512mb-nyc3-01
- IP Address: 104.236.123.34
- Username: root
- Password: ___________

### user setup:
```
$ adduser core #added new user core ________
$ gpasswd -a core sudo #Adding user core to group sudo
```
### update distro:
```
$ sudo apt-get update
$ sudo apt upgrade
```
### ssh setup:
adding an SSH key to your account: [https://cloud.digitalocean.com/settings/security?i=5458db](https://cloud.digitalocean.com/settings/security?i=5458db)
```
$ mkdir .ssh
$ chmod 700 .ssh
$ nano .ssh/authorized_keys # put in contents of mac-id_rsa_nabeel_rasheed_yahoo.pub
$ chmod 600 .ssh/authorized_keys
  # disabled root ssh login
  # edit /etc/ssh/sshd_config, change PermitRootLogin to no
$ service ssh restart # reload for changes to take effect
```
  still could not automatically log core in using keys, kept prompting for passwd
  running ssh -v core@138.197.127.244 showed that wrong key was being offered
  "Offering RSA public key: /Users/nrasheed/.ssh/id_rsa"
  so was able to login using
```
$ ssh -o "IdentitiesOnly=yes" -i ~/.ssh/mac-id_rsa_nabeel_rasheed_yahoo core@104.236.123.34
```
  or could use rasheed.work for the ip
  to make this easier, created ~/.ssh/config, and added the following entry
```
  Host rasheed.work
      IdentityFile ~/.ssh/mac-id_rsa_nabeel_rasheed_yahoo
```
  now was able to have it pick the correct public key
```
  $ ssh core@rasheed.work
```

### installing node:
[https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-16-04](https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-16-04)

  using repository:
```
$ sudo apt-get install nodejs
  # will have to run using "nodejs", instead of "node"
$ nodejs --version # this installed v4.2.6
```
using nvm (node version manager):
```
  $ sudo apt-get install build-essential libssl-dev
  $ curl -sL https://raw.githubusercontent.com/creationix/nvm/v0.33.6/install.sh -o install_nvm.sh
    # got the latest version number from https://github.com/creationix/nvm
    #this downloaded install_nvm.sh. run it with
  $ bash install_nvm.sh
  $ source ~/.profile # take effect with changes the script made to .profile
  $ nvm ls-remote # list available node versions
  $ nvm install 8.9.3
  $ node --version # v8.9.3
    # looks like this installed npm also
```

### setting up domain name:
[https://www.digitalocean.com/community/tutorials/how-to-set-up-a-host-name-with-digitalocean](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-host-name-with-digitalocean)
```
$ whois rasheed.work
    Domain Name: RASHEED.WORK
    Registry Domain ID: D_0041C900_A7284C00A8E64E49A60B8F1057A505F6_0000016040B5649F-WORK
    Registrar WHOIS Server: whois.namecheap.com
    ...
    Name Server: dns1.registrar-servers.com.
    Name Server: dns2.registrar-servers.com.

$ ping rasheed.work
    64 bytes from 162.255.119.103:
```
signed into namecheap.com to manage rasheed.work
Domain List -> Domain > Nameservers -> changed from "Nameccheap BasicDNS" to "Custom DNS"
added nameservers NS1.DIGITALOCEAN.COM, NS2.DIGITALOCEAN.COM, NS3.DIGITALOCEAN.COM
```
$ whois rasheed.work
    Domain Name: RASHEED.WORK
    Registry Domain ID: D_0041C900_A7284C00A8E64E49A60B8F1057A505F6_0000016040B5649F-WORK
    Registrar WHOIS Server: whois.namecheap.com
    ...
    Name Server: ns3.digitalocean.com.
    Name Server: ns1.digitalocean.com.
    Name Server: ns2.digitalocean.com.
```
sign in to digitalocean, Settings -> Networking - >Domains
- add domain: "rasheed.work"
- create a new A record: Hostname "@" will direct to "104.236.123.34"
- create CNAME record: Hostname "*" is an alias of "@"
```
$ ping rasheed.work
    64 bytes from 104.236.123.34
```

### installing nginx:
[https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-ubuntu-16-04](https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-ubuntu-16-04)

[https://www.digitalocean.com/community/tutorials/how-to-set-up-nginx-server-blocks-virtual-hosts-on-ubuntu-16-04](https://www.digitalocean.com/community/tutorials/how-to-set-up-nginx-server-blocks-virtual-hosts-on-ubuntu-16-04)
```
$ sudo apt-get install nginx
```
http://rasheed.work/ now shows the default "Welcome to ngingx!" page, from */var/html/index.nginx-debian.html*

That is because the config in */etc/nginx/sites-available/default*
 default_server block has the root at */var/www/html*, and index as *index.html index.htm index.nginx-debian.html*

adding my own index.html
```
$ sudo touch index.html
$ ll index.html
  -rw-r--r-- 1 root root index.html (owner is root)
$ sudo chown -R $USER:$USER index.html
  -rw-r--r-- 1 core core index.html (owner is core)
  (add content to index.html, to show up at http://rasheed.work)
```

### express and nginx:
want to run node apps off (/home/core/www/app). created a node app, with index.js looking like:
```
var express = require('express');
var app = express();
app.get('/app', function(req, res){
   res.send("Saluton Unua!");
});
app.listen(8081, '127.0.0.1');
```
start node
```
$ cd /home/core/www/app
$ node index
```
modified /etc/nginx/sites-available/default to
```
##
# Default server configuration
#
server {
        listen 80 default_server;
        listen [::]:80 default_server;
        index index.html index.htm;
        server_name _;
        location / {
                root /var/www/html;
                try_files $uri $uri/ =404;
        }
        location /app {
                root /home/core/www/app;
                proxy_pass http://127.0.0.1:8081;
                proxy_http_version 1.1;
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection 'upgrade';
                proxy_set_header Host $host;
                proxy_cache_bypass $http_upgrade;
        }
}
```
```
$ sudo nginx -t # test the config
$ sudo systemctl restart nginx # restart
```
now
- http://rasheed.work gives the default page at /var/html/index.html
- http://rasheed.work/app fires up the node app to show "Saluton Unua!"

### install and use git
```
$ sudo apt-get install git
```
to get code from the repo for the very first time
```
 $ cd /home/core/www/apps
 $ git clone https://github.com/pbxrshd/rasheed.work.git
   (creates the code into the folder /home/core/www/apps/rasheed.work/)
```
to get updates of the code:
```
$ cd /home/core/www/apps/rasheed.work
$ git pull origin
```

###setting up to run an persist using pm2
```
$ npm install -g pm2
$ cd ~/www/apps/rasheed.work/server
$ pm2 start server.js # started up server.js in a process
$ pm2 startup # to generate command to deamonize server.js
```
  printed out the following to be run, which i ran
```
 sudo env PATH=$PATH:/home/core/.nvm/versions/node/v8.9.3/bin /home/core/.nvm/versions/node/v8.9.3/lib/node_modules/pm2/bin/pm2 startup systemd -u core --hp /home/core
```
other commands
```
$ pm2 list # shows proceses pm2 is currently running
$ pm2 show server # shows informtion about the process named "server"
$ pm2 stop server
$ pms restart server
```

# Site Architecture

the express structure at the droplet is a single node app launched at server/server.js, which mounts the sub-apps
each sub app also needs to have it's path registered in the ngingx conf at */etc/nginx/sites-available/default*

node_modules is common, see how to require

see how the static assets are bring served

run standalone, comment out server startup

```
##
# Default server configuration
#
server {
        listen 80 default_server;
        listen [::]:80 default_server;
        index index.html index.htm index.nginx-debian.html;
        server_name _;
        location / {
                root /var/www/html;
                try_files $uri $uri/ =404;
        }
        location /main {
                root /home/core/www/apps/rasheed.work/server;
                proxy_pass http://127.0.0.1:8081;
                proxy_http_version 1.1;
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection 'upgrade';
                proxy_set_header Host $host;
                proxy_cache_bypass $http_upgrade;
        }
        location /ahypdata {
                root /home/core/www/apps/rasheed.work/server;
                proxy_pass http://127.0.0.1:8081;
                proxy_http_version 1.1;
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection 'upgrade';
                proxy_set_header Host $host;
                proxy_cache_bypass $http_upgrade;
        }
}
```
- http://rasheed.work gives the default page at /var/html/index.html
- http://rasheed.work/main gives the express route for '/' at server/server.js
- http://rasheed.work/ahypdata  gives the express route for '/' at ahypdata/index.js

### TODO:
 - point the multiple locations for the subapps to the same block, instead of repeating. see [http://www.thegeekstuff.com/2017/05/nginx-location-examples/](http://www.thegeekstuff.com/2017/05/nginx-location-examples/)
 - see if the repeated static files serving code in the node app can be modularized


# AlHuda Youth Program
