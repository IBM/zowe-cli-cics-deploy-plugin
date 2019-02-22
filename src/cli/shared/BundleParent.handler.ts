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

import { Logger, ICommandHandler, IHandlerParameters, ICommandArguments, ImperativeError } from "@brightside/imperative";

/**
 * Generic Command handler for a CICS bundle action
 * @export
 * @class BundleParentHandler
 * @implements {ICommandHandler}
 */
export abstract class BundleParentHandler implements ICommandHandler {

    // The name of the bundle action as used in messages. Subclasses should override this.
    public abstract actionName: string;

    /**
     * Process a command.
     * @param {IHandlerParameters} params
     * @returns {Promise<void>}
     * @memberof BundleParentHandler
     */
    public async process(params: IHandlerParameters): Promise<void> {

        // log the arguments on entry to the Handler
        const logger = Logger.getAppLogger();
        logger.debug("Arguments received by cics-deploy: " + JSON.stringify(params.arguments));

        try {
          let msg;

          // Perform an action. Each sub-class will implement its own action and
          // either throw an Exception or return a success message.
          msg = this.performAction(params);

          // Issue the success message
          params.response.console.log(msg);
          logger.debug(msg);
        } catch (except) {
          // Construct an error message for the exception
          const msg = "A failure occurred during CICS Bundle " + this.actionName + ".\n Reason = " + except.message;

          // Log the error message to the Imperative log
          logger.error(msg);

          throw new ImperativeError({msg, causeErrors: except});
        }
    }


    /**
     * Perform a Bundle action and return a status string.
     *
     * @param {IHandlerParameters} params
     * @returns {string}
     * @throws ImperativeError
     * @memberof BundleParentHandler
     */
    public abstract performAction(params: IHandlerParameters): string;
}
