const express = require('express');
const app = express();

var bodyParser = require('body-parser');
app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(express.static('public'));

app.get('/', function(request, response) {
    response.sendFile(__dirname + '/src/pages/index.hbs');

});


app.post('/testeWebHook', function(request, response) {
  response.json();
});

const path = require("path");

const fastify = require("fastify")({
  logger: false
});


fastify.register(require("fastify-static"), {
  root: path.join(__dirname, "public"),
  prefix: "/" 
});

fastify.register(require("fastify-formbody"));

fastify.register(require("point-of-view"), {
  engine: {
    handlebars: require("handlebars")
  }
});

const seo = require("./src/seo.json");
if (seo.url === "glitch-default") {
  seo.url = `https://${process.env.PROJECT_DOMAIN}.glitch.me`;
}


fastify.get("/", function(request, reply) {
  
 
  let params = { seo: seo };
  
  
  if (request.query.randomize) {
    
    const colors = require("./src/colors.json");
    const allColors = Object.keys(colors);
    let currentColor = allColors[(allColors.length * Math.random()) << 0];
    
    params = {
      color: colors[currentColor],
      colorError: null,
      seo: seo
    };
  }
  
  reply.view("/src/pages/index.hbs", params);
});


fastify.post("/", function(request, reply) {
  
  let params = { seo: seo };
  
  let color = request.body.color;
  
  if (color) {
    
    const colors = require("./src/colors.json");
    
    
    color = color.toLowerCase().replace(/\s/g, "");
    
    
    if (colors[color]) {
      
      params = {
        color: colors[color],
        colorError: null,
        seo: seo
      };
    } else {
        params = {
        colorError: request.body.color,
        seo: seo
      };
    }
  }
  reply.view("/src/pages/index.hbs", params);
});

fastify.listen(process.env.PORT, '0.0.0.0', function(err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log(`Your app is listening on ${address}`);
  fastify.log.info(`server listening on ${address}`);
});