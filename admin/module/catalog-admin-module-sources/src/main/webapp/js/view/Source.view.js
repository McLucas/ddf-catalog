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
define([
    'icanhaz',
    'marionette',
    'js/view/SourceEdit.view.js',
    'js/model/Service.js',
    'wreqr',
    'text!templates/sourcePage.handlebars',
    'text!templates/sourceList.handlebars',
    'text!templates/sourceRow.handlebars',
],
function (ich,Marionette,SourceEdit,Service,wreqr,sourcePage,sourceList,sourceRow) {

    var SourceView = {};

	ich.addTemplate('sourcePage', sourcePage);
	ich.addTemplate('sourceList', sourceList);
	ich.addTemplate('sourceRow', sourceRow);

	SourceView.SourceRow = Marionette.Layout.extend({
        template: "sourceRow",
        tagName: "tr",
        events: {
            'click .editLink': 'editSource',
            'click .enable-button':'enableSource',
            'click .disable-button':'disableSource'
        },
        regions: {
            editModal: '.modal-container',
            details: 'details'
        },
        serializeData: function(){
            var data = {};

            if (this.model && this.model.has('currentConfiguration')) {
              data = this.model.get('currentConfiguration').toJSON();
            }

            return data;
        },
        onRender: function() {
            if (this.model && this.model.has('currentConfiguration')) {
                this.editModal.show(new SourceEdit.View({model: this.model, id: this.model.get('currentConfiguration').get('id')}));
            }
        },
        editSource: function() {
            this.editModal.currentView.$el.modal();
        },
        enableSource: function(){
            var view = this;
            view.model.get('currentConfiguration').makeEnableCall().then(function(){
                wreqr.vent.trigger('refreshSources');
                view.model.destroy();
            });
        },
        disableSource: function(){
            var view = this;
            view.model.get('currentConfiguration').makeDisableCall().then(function(){
                wreqr.vent.trigger('refreshSources');
                view.model.destroy();
            });
        }
    });

    SourceView.SourceTable = Marionette.CompositeView.extend({
        template: 'sourceList',
        itemView: SourceView.SourceRow,
        itemViewContainer: 'tbody'
    });

    SourceView.SourcePage = Marionette.Layout.extend({
        template: 'sourcePage',
        events: {
            'click .refreshButton' : 'refreshSources',
            'click .addSourceLink' : 'addSource'
        },
        initialize: function(){
            this.listenTo(wreqr.vent, 'refreshSources', this.refreshSources);
        },
        regions: {
            collectionRegion: '#sourcesRegion',
            sourcesModal: '#sources-modal'
        },
        onRender: function() {
            this.collectionRegion.show(new SourceView.SourceTable({ collection: this.model.get("collection") }));
        },
        refreshSources: function() {
            var view = this;
            view.model.get('model').fetch({
                success: function(){
                    view.model.get('collection').sort();
                    view.model.get('collection').trigger('reset');
                    view.onRender();
                }
            });
        },
        addSource: function() {
            var model = this.model;
            if(model) {
                var configs = Service.ConfigurationList;
                var configuration = new Service.Configuration();
                model.get('collection').each(function(model) { 
                    console.log(model.get('currentConfiguration').get('name')); 
                });

                this.sourcesModal.show(new ModalSource.View(
                    {
                        model: this.model, 
                        id: this.model.get('id'),
                        configurations: model.get('currentConfiguration')
                    })
                );
                this.sourcesModal.currentView.$el.modal()
            }
        }
    });

    return SourceView;

});