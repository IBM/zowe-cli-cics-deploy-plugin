
# Contribution Guidelines
The contribution guidelines in this document pertain to contributing to this zowe-cli-cics-deploy-plugin repository.

We welcome bug reports and discussions about new function in the issue tracker, and we also welcome proposed new features or bug fixes via pull requests.

You should read these guidelines to help you contribute.

## Reporting a bug

Please raise bugs via the issue tracker. First, check whether an issue for your problem already exists.

When raising bugs, try to give a good indication of the exact circumstances that provoked the bug. What were you doing? What did you expect to happen? What actually happened? What logs or other material can you provide to show the problem?

## Requesting new features

Please request new features via the issue tracker. When requesting features, try to show why you want the feature you're requesting.

## Contributing code

### Before you start...

If you're thinking of fixing a bug or adding new features, be sure to open an issue first. This gives us a place to have a discussion about the work.

### Licensing

All code must have an EPL v2.0 header.  Please add the following to any new files you create:
```
/*
* This program and the accompanying materials are made available under the terms of the
* Eclipse Public License v2.0 which accompanies this distribution, and is available at
* https://www.eclipse.org/legal/epl-v20.html
*
* SPDX-License-Identifier: EPL-2.0
*
*/
```

### Signing your contribution

You must declare that you wrote the code that you contribute, or that you have the right to contribute someone else's code. To do so, you must sign the [Developer Certificate of Origin](https://developercertificate.org) (DCO):

```
Developer Certificate of Origin
Version 1.1

Copyright (C) 2004, 2006 The Linux Foundation and its contributors.
1 Letterman Drive
Suite D4700
San Francisco, CA, 94129

Everyone is permitted to copy and distribute verbatim copies of this
license document, but changing it is not allowed.


Developer's Certificate of Origin 1.1

By making a contribution to this project, I certify that:

(a) The contribution was created in whole or in part by me and I
    have the right to submit it under the open source license
    indicated in the file; or

(b) The contribution is based upon previous work that, to the best
    of my knowledge, is covered under an appropriate open source
    license and I have the right under that license to submit that
    work with modifications, whether created in whole or in part
    by me, under the same open source license (unless I am
    permitted to submit under a different license), as indicated
    in the file; or

(c) The contribution was provided directly to me by some other
    person who certified (a), (b) or (c) and I have not modified
    it.

(d) I understand and agree that this project and the contribution
    are public and that a record of the contribution (including all
    personal information I submit with it, including my sign-off) is
    maintained indefinitely and may be redistributed consistent with
    this project or the open source license(s) involved.
```


If you can certify the above, then sign off each Git commit at the bottom of the commit message with the following:

```
Signed-off-by: My Name <my.name@example.com>
```

You must use your real name and email address.

To save you having to type the above for every commit, Git can add the `Signed-off-by` line. When committing, add the `-s` option to your `git commit` command.

If you haven't signed each commit, then the pull request will fail to pass all checks.


## Developing Zowe CLI plug-ins

For guidelines on developing Zowe CLI plug-ins see the [Zowe CLI GitHub repository](https://github.com/zowe/zowe-cli). The following information is critical to working with the code, running/writing/maintaining automated tests, developing consistent syntax and ensuring that the plug-in integrates with Zowe CLI properly:

| For more information about ... | See: |
| ------------------------------ | ----- |
| General guidelines that apply to contributing to Zowe CLI and plug-ins | [Contribution Guidelines](https://github.com/zowe/zowe-cli/blob/master/CONTRIBUTING.md) |
| Conventions and best practices for creating packages and plug-ins for Zowe CLI | [Package and Plug-in Guidelines](https://github.com/zowe/zowe-cli/blob/master/docs/PackagesAndPluginGuidelines.md)|
| Guidelines for running tests on Zowe CLI | [Testing Guidelines](https://github.com/zowe/zowe-cli/blob/master/docs/TESTING.md) |
| Guidelines for running tests on the plug-ins that you build for Zowe CLI | [Plug-in Testing Guidelines](https://github.com/zowe/zowe-cli/blob/master/docs/PluginTESTINGGuidelines.md) |
| Documentation that describes the features of the Imperative CLI Framework | [About Imperative CLI Framework](https://github.com/zowe/imperative/wiki) |
Versioning conventions for Zowe CLI and plug-ins| [Versioning Guidelines](https://github.com/zowe/zowe-cli/blob/master/docs/MaintainerVersioning.md) |
