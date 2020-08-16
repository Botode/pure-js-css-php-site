<?php

function connect_db(): ?mysqli
{
    $connect = new mysqli();
    mysqli_report(MYSQLI_REPORT_STRICT);
    try {
        $connect = new mysqli('localhost', 'root', '', 'excdb');
        if ($connect->connect_error) $connect = null;
    } catch (Exception $e) {
        $connect = null;
    }
    return $connect;
}

function disconnect_db(mysqli &$connect)
{
    if (isset($connect)) {
        $connect->close();
        unset($connect);
    }
}

function userLogout($login)
{
    return;
}

function refreshid($data, bool $oldsession)
{
    if (isset($data["key"]) and is_string($data["key"]) and strlen($data["key"]) == 32) {
        $key = $data["key"];
        if ($oldsession) $_SESSION['new_id'] = MD5($_SESSION['id'] . $key);
        else $_SESSION['new_id'] = $key;
        $_SESSION['new_id_timer'] = time();
        $res = ['reply' => 'accepted_id', 'newidd' => $_SESSION['new_id'], 'oldidd' => isset($_SESSION['id']), "key" => $key, "olds" => $oldsession, "SESS"=>$_SESSION];
        return signatured($res, $_SESSION['new_id']);
    }
    return $data = ["error" => true, "msg" => "RefreshId error"];
}

function checkid($data, bool $oldsession)
{
    if (!$oldsession) return refreshid($data, $oldsession);
    $res = ['reply' => 'checked_id'];
    return signatured($res, $_SESSION['id']);
}


function setid($data)
{
    if (
        isset($_SESSION['new_id']) and ($_SESSION['new_id_timer'] > time() - 300)
        and isset($data["key"]) and is_string($data["key"]) and strlen($data["key"]) == 32
    ) {
        $data = checksign($data, "key", $_SESSION['new_id']);
        if (!isset($data["error"])) {
            if (isset($_SESSION['id'])) my_session_regenerate_id();
            if (isset($_SESSION['new_login'])) {
                $_SESSION['login'] = $_SESSION['new_login'];
                unset($_SESSION['new_login']);
            }
            $_SESSION['id'] = $_SESSION['new_id'];
            unset($_SESSION['new_id']);
            unset($_SESSION['new_id_timer']);
            $res = ['reply' => 'setted_id'];
            return signatured($res, $_SESSION['id']);
        }
        return ["error" => true, "msg" => "SetId error1", "data" => $data, "SESS" => $_SESSION];
    }
    if (isset($_SESSION['new_id']) and ($_SESSION['new_id_timer'] <= time() - 300)) {
        unset($_SESSION['new_id']);
        unset($_SESSION['new_id_timer']);
        unset($_SESSION['new_login']);
    }
    return ["error" => true, "msg" => "SetId error2", "data" => $data, "SESS" => $_SESSION];
}

function signin($data)
{
    if (
        !isset($_SESSION['login']) and isset($data["login"]) and is_string($data["login"])
        and isset($data["passw"]) and is_string($data["passw"]) and strlen($data["passw"]) == 32
    ) {
        $login = filter_var(trim($data["login"]), FILTER_SANITIZE_STRING);
        $passw = filter_var(trim($data["passw"]), FILTER_SANITIZE_STRING);
        if ($login == $data["login"] and $passw == $data["passw"]) {
            $connect = connect_db();
            $result = $connect->query("SELECT * FROM `users` WHERE `login`='$login'");
            disconnect_db($connect);
            if ($result->num_rows > 0) {
                $user = $result->fetch_assoc();
                if ($user['passw'] == md5($passw . $user['salt'])) {
                    my_session_regenerate_id();
                    $_SESSION['new_login'] = $login;
                    $res = ["reply" => "signed_in", "name" => $user["name"], "login" => $user["login"]];
                    return signatured($res, $_SESSION['id']);
                }
                return ["error" => true, "msg" => "No password", "test" => md5(md5("test")."69f0027d0930228d9032950b8fb72915")];
            }
            return ["error" => true, "msg" => "No user"];
        }
        return ["error" => true, "msg" => "Incorrect login or password"];
    }
    return $data = ["error" => true, "msg" => "Signin error"];
}


function dataproc($data, bool $oldsession)
{
    if (isset($data["command"]) and is_string($data["command"])) {
        $command = $data["command"];
        if ($command == "refresh_id") return refreshid($data, $oldsession);
        elseif ($command == "set_id") return setid($data);
        elseif ($command == "check_id") return checkid($data, $oldsession);
        elseif ($oldsession) {
            if ($command == "sign_in") return signin($data);
        }
        return ["error" => true, "msg" => "command not found", "data" => $data["command"]];
    }
    return ["error" => true, "msg" => "Command error", "data" => $data];
}

function signatured(&$data, $key)
{
    if (isset($data) and is_array($data) and isset($key) and is_string($key) and strlen($key) == 32) {
        $hash = md5(bin2hex(random_bytes(16)));
        $data['hash'] = $hash;
        $jsstr = json_encode($data, JSON_UNESCAPED_SLASHES);
        $sign = MD5($jsstr . $key);
        $data['sign'] = $sign;
        return $data;
    }
    return ["error" => true, "msg" => "Sign not compared"];
}

function checksign(&$data, string $key, $token)
{
    $sign = $data[$key];
    $id = $token;
    unset($data[$key]);
    $jsstr = json_encode($data, JSON_UNESCAPED_SLASHES);
    if ($key == "sign") unset($data["hash"]);
    $csign = MD5($jsstr . $id);
    if ($sign == $csign) return $data;
    else return ["error" => true, "msg" => "CheckSign failed", "datan" => $data, "keyn" => $key, "token" => $token, "signn" => $sign, "csign" => $csign, "strn" => $jsstr, "SESS" => $_SESSION];
}

function fromJSON(bool $check)
{
    if (isset($_POST['data'])) {
        $jsstr = $_POST['data'];
        $data = json_decode($jsstr, true);
        if (json_last_error() != JSON_ERROR_NONE) $data = ["error" => true, "msg" => "JSON last error"];
        elseif (!isset($data["sign"]) or !is_string($data["sign"]) or strlen($data["sign"]) != 32) $data = ["error" => true, "msg" => "Sign error", "fdfd" => $data];
        elseif ($check && !(isset($data["newid"]) and $data["newid"])) $data = checksign($data, "sign", $_SESSION['id']);
        else {
            unset($data["sign"]);
            unset($data["hash"]);
        }
    } else $data = ["error" => true, "msg" => "Data error"];
    return $data;
}

function toJSON($data): string
{
    if (!isset($data)) $data = ["error" => true, "msg" => "toJSON failed"];
    return json_encode($data, JSON_UNESCAPED_SLASHES);
}

function getLogin()
{
    if (!isset($_SESSION['id'])) {
        return ['err' => true, 'login1' => 'retry', 'sess' => session_id()];
    } else {
        $id = $_SESSION['id'];
        $jsstr = $_POST['data'];
        $data = json_decode($jsstr, true);
        $login = filter_var(trim($data["login"]), FILTER_SANITIZE_STRING);
        $passw = filter_var(trim($data["passw"]), FILTER_SANITIZE_STRING);
        $passw = md5($passw . $id);
        $hash = $data["hash"];
        unset($data["hash"]);
        $jsstr = json_encode($data, JSON_UNESCAPED_SLASHES);


        $chash = MD5($jsstr . $id);
        if ($chash != $hash) {
            return ['err' => true, 'id' => 'incorrect', 'idd' => $id, 'login1' => $login, 'passw1' => $passw, 'sess' => session_id()];
        } else {
            $connect = connect_db();
            $result = $connect->query("SELECT * FROM `users` WHERE `login`='$login'");
            if ($result->num_rows > 0) {
                $result = $connect->query("SELECT * FROM `users` WHERE `login`='$login' AND `passw` = '$passw'");
                if ($result->num_rows > 0) {
                    $user = $result->fetch_assoc();
                    return ['err' => false, 'login' => $login, 'name' => $user["name"], 'idd' => $id, 'login1' => $login, 'passw1' => $passw, 'sess' => session_id()];
                    $_SESSION['USER'] = $login;
                } else return ['err' => true, 'passw' => 'incorrect', 'idd' => $id, 'login1' => $login, 'passw1' => $passw, 'sess' => session_id()];
            } else {
                $user = $result->fetch_assoc();
                return ['err' => true, 'login' => 'incorrect', 'idd' => $id, 'login1' => $login, 'passw1' => $passw, 'sess' => session_id()];
            }
        }
    }
}

function logout_all_sessions($login)
{
    return $login;
}

function my_session_start(): bool
{
    if (session_status() != PHP_SESSION_ACTIVE) {
        ini_set('session.use_strict_mode', 1);
        session_set_cookie_params(["httponly" => true, "samesite" => "Strict"]);
        session_start();
    }
    $flag = isset($_SESSION['id']);
    if (isset($_SESSION['destroyed'])) {
        if ($_SESSION['destroyed'] < time() - 30) {
            if (isset($_SESSION['login'])) logout_all_sessions($_SESSION['login']);
            session_destroy();
            my_session_start();
            my_session_regenerate_id(false);
            $flag = false;
        }
        if (isset($_SESSION['new_session_id'])) {
            session_commit();
            session_id($_SESSION['new_session_id']);
            $flag = my_session_start();
        }
    } elseif (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity'] > 20)) {
        my_session_regenerate_id();
    }
    $_SESSION['last_activity'] = time();
    if (!isset($_SESSION['created'])) {
        $_SESSION['created'] = time();
        $flag = false;
    } else if (time() - $_SESSION['created'] > 10) {
        my_session_regenerate_id();
    }
    return $flag;
}

function my_session_regenerate_id($flag = true): bool
{
    $new_session_id = session_create_id();
    if ($flag) $data = session_encode();
    $_SESSION['new_session_id'] = $new_session_id;
    $_SESSION['destroyed'] = time();
    session_commit();
    ini_set('session.use_strict_mode', 0);
    session_id($new_session_id);
    session_start();
    if ($flag) session_decode($data);
    unset($_SESSION['destroyed']);
    unset($_SESSION['new_session_id']);
    $_SESSION['last_activity'] = time();
    $_SESSION['created'] = time();
    return isset($_SESSION['id']);
}
