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

import { ICommandHandler, IHandlerParameters, ImperativeError } from "@brightside/imperative";
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


        // Call the auto-bundler to process the contents of the current working directory.
        try {
          const autobundler = new AutoBundler(process.cwd(), params);
          if (params.arguments.nosave !== "true") {
            autobundler.save();
          }
          if (autobundler.getBundle().getId() === undefined) {
            params.response.console.log("Anonymous CICS Bundle generated");
          }
          else {
            params.response.console.log('CICS Bundle "' + autobundler.getBundle().getId() + '" generated');
          }
        } catch (except) {
            const message = "A failure occurred during CICS Bundle generation.\n" +
                "Reason = " + except.message;

            throw new ImperativeError({msg: message, causeErrors: except});
        }
    }
}
