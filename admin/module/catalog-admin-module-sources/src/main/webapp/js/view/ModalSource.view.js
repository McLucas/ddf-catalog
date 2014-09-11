/**
 * Copyright (c) Codice Foundation
 *
 * This is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser
 * General Public License as published by the Free Software Foundation, either version 3 of the
 * License, or any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without
 * even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details. A copy of the GNU Lesser General Public License
 * is distributed along with this program and can be found at
 * <http://www.gnu.org/licenses/lgpl.html>.
 *
 **/
/*global define*/
/** Main view page for add. */
define(function (require) {

    var Backbone = require('backbone'),
        Marionette = require('marionette'),
        ModalDetails = require('js/view/ModalSourceDetails.js'),
        SourceEdit = require('js/view/SourceEdit.view.js'),
        _ = require('underscore'),
        ich = require('icanhaz');

    ich.addTemplate('modalSource', require('text!templates/sourceModal.handlebars'));
    //these templates are part of the admin ui and we expect them to be there
    if(!ich.optionListType) {
        ich.addTemplate('optionListType', require('text!templates/optionListType.handlebars'));
    }

    var ModalSource = {};

    ModalSource.View = Marionette.Layout.extend({
        template: 'modalSource',
        tagName: 'div',
        className: 'modal',
        configurations: null,
        /**
         * Button events, right now there's a submit button
         * I do not know where to go with the cancel button.
         */
        events: {
            "change .sourceTypesSelect" : "renderDetails",
            "click .submit-button": "submitData",
            "click .cancel-button": "cancel"
        },
        regions: {
            details: '.modal-details'
        },

        /**
         * Initialize  the binder with the ManagedServiceFactory model.
         * @param options
         */
        initialize: function(options) {
            _.bindAll(this);
            this.configurations = options.configurations;
            this.modelBinder = new Backbone.ModelBinder();
        },
        onRender: function() {
            this.$el.attr('tabindex', "-1");
            this.$el.attr('role', "dialog");
            this.$el.attr('aria-hidden', "true");
            this.renderTypeDropdown();
            var bindings = Backbone.ModelBinder.createDefaultBindings(this.el, 'name');
        },
        /**
         * Renders the type dropdown box
         */
        renderTypeDropdown: function() {
            var collection = this.model.get('collection');
            var configs = new Backbone.Collection();
            _.each(collection.models, function(item) {
                //if this doesn't have an fpid it isn't a managed service factory
                //if it isn't a managed service factory then we can't select anything in the drop down
                var current = item.get('currentConfiguration');
//                if(current.get("fpid")) {
                    configs.add(current);
//                }
            });
            
            var $sourceTypeSelect = this.$(".sourceTypesSelect");
            $sourceTypeSelect.append(ich.optionListType({"list": {id : "none", name: "Select Type"}}));
            if (!_.isEmpty(configs)) {
                var selectedId = collection.at(0).get("fpid");
                $sourceTypeSelect.append(ich.optionListType({"list": configs.toJSON()}));
//                $sourceTypeSelect.val(selectedId);
//                $sourceTypeSelect.trigger('change', $sourceTypeSelect);
            }
        },

        /**
         * Submit to the backend.
         */
        submitData: function() {
            this.model.get('currentConfiguration').save();
        },
        /**
         * unbind the model and dom during close.
         */
        onClose: function () {
            this.modelBinder.unbind();
        },
        cancel: function() {
            //TODO discard changes somehow
        },
        renderDetails: function(evt) {
            var collection = this.model.get('collection');
            var $select = $(evt.currentTarget);
            if ($select.hasClass('sourceTypesSelect')) {
                var detailsModel = _.find(collection.models, function(item) {
                    console.log(item.get('currentConfiguration').get('id'));
                    return item.get('currentConfiguration').get('id') === $select.val();
                });
                if (!_.isUndefined(detailsModel)) {
                    var currentConfig = detailsModel.get('currentConfiguration');
                    this.details.show(new ModalDetails.View({
                        model: currentConfig, 
                        id: currentConfig.get('id') 
//                        bindingProps: {
//                            modelBinder: this.modelBinder,
//                            bindings: bindings
//                        }
                    }));
//                    this.modelBinder.bind(detailsModel.get('currentConfiguration').get('properties'), this.$el, bindings);
                } else {
                    this.details.$el.html('');
                }
            }
        }
    });

    return ModalSource;

});