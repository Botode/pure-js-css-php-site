<?php
$login = filter_var(trim($_POST['login']), FILTER_SANITIZE_STRING);
$name = filter_var(trim($_POST['name']), FILTER_SANITIZE_STRING);
$passw = filter_var(trim($_POST['passw']), FILTER_SANITIZE_STRING);

if (mb_strlen($login) < 5 || mb_strlen($login) > 90) {
    $res = array('err' => 1, 'login' => 'incorrect');
    echo json_encode($res);
    exit();
}

if (mb_strlen($name) < 3 || mb_strlen($name) > 90) {
    $res = array('err' => 1, 'name' => 'incorrect');
    echo json_encode($res);
    exit();
}

if (mb_strlen($passw) < 3 || mb_strlen($passw) > 8) {
    $res = array('err' => 1, 'passw' => 'incorrect');
    echo json_encode($res);
    exit();
}

$passw = md5($passw . "0qwwergmw1234f3424f");

require_once 'connect.php';

$result = $connect->query("SELECT * FROM `users` WHERE `login`='$login'");

$user = $result->fetch_assoc();

if (count($user) != 0) {
    $res = array('err' => 1, 'login' => 'exists');
    echo json_encode($res);
    exit();
}

$connect->query("INSERT INTO `users` (`login`, `passw`, `name`) VALUES('$login','$passw','$name')");
$connect->close();
$res = array('err' => 0, 'login' => $login, 'name' => $name, 'passw' => $passw);

echo json_encode($res);
