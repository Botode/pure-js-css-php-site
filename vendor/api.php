<?php
require_once 'func.php';

$oldsession = my_session_start();

if (date_default_timezone_get() != "Asia/Barnaul")
    date_default_timezone_set("Asia/Barnaul");

function getresponse(bool $oldsession)  
{
    $data = fromJSON($oldsession);
    if (isset($data["newid"]) and $data["newid"]) {
        my_session_regenerate_id(false);
        $oldsession = false;
    }
    if ($data && !(isset($data["error"]) && $data["error"])) {
        $response = dataproc($data, $oldsession);
    } else {
        if (isset($_SESSION["login"]) && $oldsession)
            userLogout($_SESSION("login"));
        $response = ["error" => true, "hhh" => $data];
    }
    return $response;
}
$response = getresponse($oldsession);
if (isset($response["error"])) {
    session_destroy();
    setcookie("PHPSESSID", "", time() - 3600);
}

echo toJSON($response);
