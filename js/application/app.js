require('js/dependencies/handlebars-runtime');
require('js/dependencies/ember');

require('js/dependencies/compiled/templates');

//Ember.LOG_BINDINGS = true;

window.App = Ember.Application.create({
  rootElement: '#root'
});

require('js/application/routes/router');

require('js/application/controllers/application_controller');
require('js/application/views/application_view');