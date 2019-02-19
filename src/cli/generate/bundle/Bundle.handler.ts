/*
* This program and the accompanying materials are made available under the terms of the
* Eclipse Public License v2.0 which accompanies this distribution, and is available at
* https://www.eclipse.org/legal/epl-v20.html
*
* SPDX-License-Identifier: EPL-2.0
*
* Copyright IBM Corp, 2019
*
*/

import { Logger, ICommandHandler, IHandlerParameters, ICommandArguments } from "@brightside/imperative";
import { AutoBundler } from "../../../api/AutoBundler";

/**
 * Command handler for automatically bundle enabling a directory
 * @export
 * @class BundleHandler
 * @implements {ICommandHandler}
 */
export default class BundleHandler implements ICommandHandler {

    private static ERROR_RESP_CODE = 8;

    /**
     * Process the generate bundle command.
     * @param {IHandlerParameters} params
     * @returns {Promise<void>}
     * @memberof BundleHandler
     */
    public async process(params: IHandlerParameters): Promise<void> {

        // log the arguments on entry
        const logger = Logger.getAppLogger();
        logger.debug("Arguments received by cics-deploy: " + JSON.stringify(params.arguments));

        // Call the auto-bundler to process the contents of the current working directory.
        try {
          const autobundler = new AutoBundler(process.cwd(), params);
          if (params.arguments.nosave !== "true") {
            autobundler.save();
          }

          // Create a response message
          let msg;
          if (autobundler.getBundle().getId() === undefined) {
            msg = "Anonymous CICS Bundle generated";
          }
          else {
            msg = 'CICS Bundle "' + autobundler.getBundle().getId() + '" generated';
          }

          // Issue the message to the console for the user
          params.response.console.log(msg);

          // Log the error message to the Imperative log
          logger.debug(msg);
        } catch (except) {

          // Construct an error message for the exception
          const msg = "A failure occurred during CICS Bundle generation.\n Reason = " + except.message;

          // Log the error message to the console for the user
          params.response.console.error(msg);

          // Log the error message to the Imperative log
          logger.error(msg);
        }
    }
}
