## Prerequisite Technologies

### Linux
* *Node.js* - <a href="http://nodejs.org/download/">Download</a> and Install Node.js, nodeschool has free <a href=" http://nodeschool.io/#workshoppers">node tutorials</a> to get you started.

If you're using ubuntu, this is the preferred repository to use...

```bash
curl -sL https://deb.nodesource.com/setup | sudo bash -
sudo apt-get update
sudo apt-get install nodejs
```

* *Git* - Get git using a package manager or <a href="http://git-scm.com/downloads">download</a> it.

### Windows
* *Node.js* - <a href="http://nodejs.org/download/">Download</a> and Install Node.js, nodeschool has free <a href=" http://nodeschool.io/#workshoppers">node tutorials</a> to get you started.
* *Git* - The easiest way to install git and then run the rest of the commands through the *git bash* application (via command prompt) is by downloading and installing <a href="http://git-scm.com/download/win">Git for Windows</a>

### OSX
* *Node.js* -  <a href="http://nodejs.org/download/">Download</a> and Install Node.js or use the packages within brew or macports.
* *git* - Get git <a href="http://git-scm.com/download/mac">from here</a>.

### Installation
```bash
cd <your_project_folder>/ && git clone git@github.com:altDriver/feed.git
npm install
gulp
```

## Prerequisite packages
* *gulp* - if for any reason gulp id not installed properly by executing npm install, you can install gulp globally with the following command
```bash
npm install -g gulp
```

### Available gulp tasks

scripts
	runs dependency task(s): lint, browserify
clean
lint
assets
css
	runs dependency task(s): css:min
css:min
	runs dependency task(s): css:sass, css:lint
css:lint
css:sass
env:development
env:production
devServe
	runs dependency task(s): env:development
watch
build
	runs task sequence: clean, assets, css, scripts, (callback fn)
default 
	runs dependency task(s): build, devServe, watch

### TODO update with full EBS steps and remove EC2 instructions

### EBS Required Environment Variables
appname - the app's nicename (eg. altdriver)
AWS_SECRET_KEY - aws secret key
AWS_ACCESS_KEY_ID - asw access key
SES_USER_CONTENT_EMAIL - email address for SES (defaults to dev@altdriver.com if not provided)


### Running on ec2

#ssh into the ec2 host (check ec2 console for host ip address <HOST_ADDRESS>)
ssh -i "<path/to/your_pem_file.pem>" ec2-user@<HOST_ADDRESS>

#change directory to the 'feed' directory'
cd feed/

** run npm install - only if new packages were added **

#start server
sudo PORT 80 = npm start

#stop server
sudo PORT 80 = npm stop

* npm start will run the gulp:build task and then user forever to start the server