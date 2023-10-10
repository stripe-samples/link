<?php
require './shared.php';

try {
  $paymentIntent = $stripe->paymentIntents->retrieve($_GET['payment_intent'], ['expand' => ['payment_method']]);
} catch (\Stripe\Exception\ApiErrorException $e) {
  http_response_code(400);
  error_log($e->getError()->message);
?>
  <h1>Error</h1>
  <p>Failed to create a PaymentIntent</p>
  <p>Please check the server logs for more information</p>
<?php
  exit;
} catch (Exception $e) {
  error_log($e);
  http_response_code(500);
  exit;
}
?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Link with Stripe</title>
    <meta name="description" content="A demo of Stripe" />

    <link rel="icon" href="favicon.ico" type="image/x-icon" />
    <link rel="stylesheet" href="css/normalize.css" />
    <link rel="stylesheet" href="css/global.css" />
    <script src="https://js.stripe.com/v3/"></script>
    <script src="/utils.js"></script>
  </head>
  <body>
    <div class="sr-root">
      <div class="sr-main">
        <h1>Success</h1>
        <div id="messages" style="display: block;"><?= json_encode($paymentIntent, JSON_PRETTY_PRINT) ?></div>
      </div>
    </div>
  </body>
</html>

