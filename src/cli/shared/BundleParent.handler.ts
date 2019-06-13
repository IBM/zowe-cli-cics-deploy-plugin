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

import { Logger, ICommandHandler, IHandlerParameters, ICommandArguments, ImperativeError, Imperative } from "@brightside/imperative";

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

        // Initialise Imperative if it is not already initialised
        try {
          // But not if silent mode is requested (i.e. unit tests)
          if (params.arguments.silent === undefined) {
            await Imperative.init();
          }
        }
        catch (err) {
          // Imperative may refuse to initialise in unit tests... never mind
        }

        // log the arguments on entry to the Handler
        const logger = Logger.getAppLogger();
        if (params.arguments.silent === undefined) {

          // Strip passwords from the data before logging it
          let inputParms = JSON.stringify(params.arguments);
          inputParms = this.replacePassword(inputParms, params.arguments.zpw);
          inputParms = this.replacePassword(inputParms, params.arguments.spw);
          inputParms = this.replacePassword(inputParms, params.arguments.cpw);

          logger.debug("Arguments received by cics-deploy: " + inputParms);
        }

        try {
          let msg;

          // Perform an action. Each sub-class will implement its own action and
          // either throw an Exception or return a success message.
          msg = await this.performAction(params);

          // Add a newline char if its needed
          if (msg.slice(-1) !== "\n") {
            msg += "\n";
          }

          // Issue the success message
          params.response.console.log(Buffer.from(msg));
          if (params.arguments.silent === undefined) {
            logger.debug(msg);
          }
        } catch (except) {
          // Construct an error message for the exception
          const msg = "A failure occurred during CICS bundle " + this.actionName + ".\n Reason = " + except.message;

          // Log the error message to the Imperative log
          if (params.arguments.silent === undefined) {
            logger.error(msg);
          }

          throw new ImperativeError({msg, causeErrors: except});
        }
    }


    /**
     * Perform a Bundle action and return a status string.
     *
     * @param {IHandlerParameters} params
     * @returns {Promise<string>}
     * @throws ImperativeError
     * @memberof BundleParentHandler
     */
    public abstract async performAction(params: IHandlerParameters): Promise<string>;

    private replacePassword(source: string, pwd: string): string {
      if (pwd !== undefined) {
        return source.split(pwd).join("*REDACTED*");
      }
      return source;
    }
}
