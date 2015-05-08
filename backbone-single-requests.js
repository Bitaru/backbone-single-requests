//     Backbone Single Requests v0.1
//     by Joe Vu - joe.vu@homeslicesolutions.com
//     For all details and documentation:
//     https://github.com/homeslicesolutions/backbone-single-requests

(function (factory) {

    // Set up Stickit appropriately for the environment. Start with AMD.
    if (typeof define === 'function' && define.amd) {
        define(['underscore', 'backbone'], factory);
    }

    // Next for Node.js or CommonJS.
    else if (typeof exports === 'object') {
        factory(require('underscore'), require('backbone'));
    }

    // Finally, as a browser global.
    else {
        factory(_, Backbone);
    }

}(function (_, Backbone) {

    // Copy the original Backbone.Sync
    var OrigBackboneSync = Backbone.sync;

    // New Backbone.Sync
    Backbone.sync = function( method, model, options ) {

        // Set Defaults ( if "singleRequests" is set, then follow that, other wise default to "false" )
        _.defaults(options || (options = {}), {
            abortRequests: this.singleRequests !== void 0 ? this.singleRequests : false
        });

        // Register requests to cache
        this._requests = this._requests || [];

        // Cancel previous requests
        if ( options.abortRequests ) {

            // Abort them all
            _.each( this._requests, function( request ){
                request.abort();
            });

            // Reset Array
            this._requests = [];

            // Abort is not error, so try to catch that
            var error = options.error;
            options.error = function(resp) {
                if ( resp.statusText === 'abort' ) return model.trigger( 'abort', model, resp, options );
                if ( error ) error( model, resp, options );
            }

        }

        // Execute
        this._requests.push( OrigBackboneSync.apply( this, arguments ) );

        // Return last XHR
        return this._requests[ this._requests.length-1 ];
    }
    return Backbone.sync;
}));
