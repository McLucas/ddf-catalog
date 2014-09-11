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
define(function (require) {

	
    var ich = require('icanhaz'),
        Marionette = require('marionette'),
        SourceEdit = require('js/view/SourceEdit.view.js'),
        ModalSource = require('js/view/ModalSource.view.js'),
        Service = require('js/model/Service.js');

    var SourceView = {};

	ich.addTemplate('sourcePage', require('text!templates/sourcePage.handlebars'));
	ich.addTemplate('sourceList', require('text!templates/sourceList.handlebars'));
	ich.addTemplate('sourceRow', require('text!templates/sourceRow.handlebars'));

	SourceView.SourceRow = Marionette.Layout.extend({
        template: "sourceRow",
        tagName: "tr",
        events: {
            'click .editLink': 'editSource'
        },
        regions: {
            editModal: '.modal-container'
        },
        serializeData: function(){
            var data = {};

            if (this.model) {
              data = this.model.get('currentConfiguration').toJSON();
            }

            return data;
        },
        onRender: function() {
            this.editModal.show(new SourceEdit.View({model: this.model, id: this.model.get('currentConfiguration').get('id')}));
        },
        editSource: function() {
            this.editModal.currentView.$el.modal();
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
        regions: {
            collectionRegion: '#sourcesRegion',
            sourcesModal: '#sources-modal'
        },
        onRender: function() {
            this.collectionRegion.show(new SourceView.SourceTable({ collection: this.model.get("collection") }));
        },
        refreshSources: function() {
            this.model.fetch();
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