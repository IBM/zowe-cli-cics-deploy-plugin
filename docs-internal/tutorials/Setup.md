# Setting up your development environment
Before you can develop for the cics-deploy plugin, follow these steps to set up your environment.

## Prequisites
### Install Zowe CLI & CICS plugin
You'll need to install the @lts-incremental branch of Zowe CLI to develop for the cics-deploy plugin.
You'll also need the CICS plugin
```
npm config set @brightside:registry https://api.bintray.com/npm/ca/brightside
npm install -g @brightside/core@lts-incremental
zowe plugins install @brightside/cics@lts-incremental
```

## Initial setup 
To create your development space, you will clone and build [zowe-cli-cics-deploy-plugin]() from source.

Before you clone the repository, create a local development folder named `cics-deploy`. You will clone and build all projects in this folder.

### Clone zowe-cli-cics-deploy-plugin and build from source
Clone the repository into your development folder to match the following structure:
```
cics-deploy
  \zowe-cli-cics-deploy-plugin
```

1. `cd` to your `cics-deploy` folder
2. `git clone https://github.com/IBM/zowe-cli-cics-deploy-plugin`
3. `cd zowe-cli-cics-deploy-plugin`
4. `npm install`
5. `npm run build`

    The first time that you build, the script will interactively ask you for the location of your Zowe CLI directory. Subsequent builds will not ask again.
    
    The build script creates symbolic links. On Windows, you might need to have Administrator privileges to create those symbolic links.
    If you change Node versions, you may need to remove the `node_modules` directory and rerun `npm install` to ensure native dependencies are rebuilt.

### (Optional) Run the automated tests

1. `cd` to your `zowe-cli-cics-deploy-plugin` folder
2. `npm run test`

## Next steps
After you complete your setup, follow the [Installing the cics-deploy plug-in to Zowe CLI](./cics-deploy/CICSDeployPlugin.md) tutorial to install this cics-deploy plug-in to Zowe CLI.
