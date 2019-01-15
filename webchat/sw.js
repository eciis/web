(function () {
  self.addEventListener('fetch', (event) => {
    console.log(event);
    if (event.request.url === 'http://localhost:8082/api/events?page=0&limit=15') {
      event.respondWith(
        fetch(event.request).then((response) => {
          console.log("response event", response);
          const errorConfig = {
            status: 404,
            statusText: "statusText",
          };
          const errorData = {
            msg: "erro mock"
          };
          return new Response(JSON.stringify(errorData), errorConfig);
        })
      );
    };
  });
})();
