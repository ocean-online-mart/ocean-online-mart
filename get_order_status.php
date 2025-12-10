<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');
include "../../seyfert_config.php";

try {
    $conn = dbconnect();
    if (!$conn) {
        echo json_encode(["success" => false, "message" => "Database connection failed"]);
        exit;
    }

    $order_id = isset($_POST['order_id']) ? $_POST['order_id'] : null;

    if (!$order_id) {
        echo json_encode(['success' => false, 'message' => 'No order ID provided']);
        exit;
    }

    // Query to fetch order status
    $stmt = $conn->prepare("SELECT order_status FROM tb1_orders WHERE order_id = ?");
    $stmt->execute([$order_id]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($result && isset($result['order_status'])) {
        echo json_encode(['success' => true, 'status' => $result['order_status']]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Order not found']);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>