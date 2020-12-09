using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.SelfHost;

namespace TtsHost
{
    class Program
    {
        static void Main(string[] args)
        {
            var config = new HttpSelfHostConfiguration("http://localhost:7777");

            config.Routes.MapHttpRoute(
                "API Default", "api/{controller}/{id}",
                new { id = RouteParameter.Optional });

            using (HttpSelfHostServer server = new HttpSelfHostServer(config))
            {
                server.OpenAsync().Wait();
                Console.WriteLine("Press Enter to quit.");
                Console.ReadLine();
            }
        }
    }

    public class TtsController : ApiController
    {
        public HttpResponseMessage Get(string id)
        {
            if (String.IsNullOrEmpty(id))
                return Request.CreateResponse(HttpStatusCode.BadRequest);

            HttpResponseMessage response = new HttpResponseMessage(HttpStatusCode.OK);

            using (var web = new WebClient())
            {
                var data = web.DownloadData(string.Format("http://translate.google.com/translate_tts?ie=UTF-8&tl=en&q={0}", id));
                Console.WriteLine(id);
                response.Content = new ByteArrayContent(data);
                response.Content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("audio/mpeg");
            }
            return response;
        }
    }

}
