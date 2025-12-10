package com.oceanonlinemart.app
import android.content.Intent
import android.net.Uri
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.webkit.CookieManager
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.webkit.GeolocationPermissions
import androidx.activity.addCallback
class MainActivity : AppCompatActivity() {
    private lateinit var webView: WebView
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        webView = findViewById(R.id.webview)
        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                val url = request.url.toString()
                // :heavy_check_mark: Handle UPI / Razorpay / GPay / PhonePe / Paytm external apps
                if (
                    url.startsWith("upi:") ||
                    url.startsWith("intent:") ||
                    url.contains("gpay") ||
                    url.contains("tez") ||
                    url.contains("phonepe") ||
                    url.contains("paytm")
                ) {
                    return try {
                        val intent = Intent.parseUri(url, Intent.URI_INTENT_SCHEME)
                        intent.addCategory(Intent.CATEGORY_BROWSABLE)
                        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
                        startActivity(intent)
                        true
                    } catch (e: Exception) {
                        e.printStackTrace()
                        true
                    }
                }
                return false
            }
        }
        webView.webChromeClient = object : WebChromeClient() {

            override fun onGeolocationPermissionsShowPrompt(
                    origin: String?,
                    callback: GeolocationPermissions.Callback?
                ) {
                    callback?.invoke(origin, true, false)
                }
            override fun onJsAlert(
                view: WebView?,
                url: String?,
                message: String?,
                result: android.webkit.JsResult?
            ): Boolean {
                val builder = androidx.appcompat.app.AlertDialog.Builder(this@MainActivity)
                builder.setTitle("Ocean Online Mart")   // :heavy_check_mark: Custom title
                builder.setMessage(message)             // :heavy_check_mark: Shows only your message, no website name
                builder.setPositiveButton("OK") { dialog, _ ->
                    result?.confirm()
                    dialog.dismiss()
                }
                builder.setCancelable(false)
                builder.create().show()
                return true
            }
        }
        val webSettings = webView.settings
        webSettings.setGeolocationEnabled(true)
        webSettings.javaScriptEnabled = true
        webSettings.domStorageEnabled = true
        webSettings.databaseEnabled = true
        webSettings.useWideViewPort = true
        webSettings.loadWithOverviewMode = true
        webSettings.allowContentAccess = true
        webSettings.allowFileAccess = true
        webSettings.javaScriptCanOpenWindowsAutomatically = true
        webSettings.setSupportMultipleWindows(true)
        webSettings.mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
        webSettings.userAgentString =
            "Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36"
        CookieManager.getInstance().setAcceptCookie(true)
        CookieManager.getInstance().setAcceptThirdPartyCookies(webView, true)
        webView.loadUrl("https://oceanonlinemart.com/newsite/")
        // Back button
        onBackPressedDispatcher.addCallback(this) {
            if (webView.canGoBack()) {
                webView.goBack()
            } else {
                finish()
            }
        }
    }
}