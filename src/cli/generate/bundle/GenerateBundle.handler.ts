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
import { AutoBundler } from "../../../api/BundleContent/AutoBundler";
import { BundleParentHandler } from "../../shared/BundleParent.handler";

/**
 * Command handler for generating a bundle
 * @export
 * @class GenerateBundleHandler
 * @implements {ICommandHandler}
 */
export default class GenerateBundleHandler extends BundleParentHandler implements ICommandHandler {

    public actionName = "generation";

    /**
     * Perform the GENERATE BUNDLE action.
     *
     * @param {IHandlerParameters} params
     * @returns {Promise<string>}
     * @throws ImperativeError
     * @memberof DeployBundleHandler
     */
    public async performAction(params: IHandlerParameters): Promise<string> {
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
        msg = 'CICS Bundle generated with bundleid "' + autobundler.getBundle().getId() + '"';
      }
      return msg;
    }
}
