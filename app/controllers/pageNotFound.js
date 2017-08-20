/**
 * Handle 404 (Page Not Found)
 * start:  2017.08.20
 * update: 2017.08.20
 * version:
 *     2017.08.20 [ADD]  1st Version
 */

exports.handle404 = async function(ctx) {
  // we need to explicitly set 404 here
  // so that koa doesn't assign 200 on body=
  ctx.status = 404;

  switch (ctx.accepts('html', 'json')) {
    case 'html':
      ctx.type = 'html';
      ctx.body = '<p>Page Not Found 123</p>';
      break;
    case 'json':
      ctx.body = {
        message: 'Page Not Found 123'
      };
      break;
    default:
      ctx.type = 'text';
      ctx.body = 'Page Not Found 123';
  }
} // exports.handle404
