import UIKit
import Capacitor

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?
    private var statusBarBackgroundView: UIView?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        let brandBlue = UIColor(red: 86.0 / 255.0, green: 105.0 / 255.0, blue: 255.0 / 255.0, alpha: 1.0)

        window?.backgroundColor = brandBlue
        window?.rootViewController?.view.backgroundColor = brandBlue

        DispatchQueue.main.async { [weak self] in
            guard let self = self,
                  let window = self.window else { return }

            // Enable the native iOS edge-swipe back/forward gestures for the Capacitor WKWebView.
            if let bridgeViewController = window.rootViewController as? CAPBridgeViewController {
                bridgeViewController.webView?.allowsBackForwardNavigationGestures = true
            }

            let topInset = window.safeAreaInsets.top
            guard topInset > 0 else { return }

            let statusBarView = UIView(frame: CGRect(x: 0, y: 0, width: window.bounds.width, height: topInset))
            statusBarView.backgroundColor = brandBlue
            statusBarView.autoresizingMask = [.flexibleWidth, .flexibleBottomMargin]
            statusBarView.isUserInteractionEnabled = false
            statusBarView.tag = 5669

            window.viewWithTag(5669)?.removeFromSuperview()
            window.addSubview(statusBarView)
            self.statusBarBackgroundView = statusBarView
        }

        return true
    }

    func applicationWillResignActive(_ application: UIApplication) {
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Re-apply in case the WebView was recreated while the app was inactive.
        if let bridgeViewController = window?.rootViewController as? CAPBridgeViewController {
            bridgeViewController.webView?.allowsBackForwardNavigationGestures = true
        }
    }

    func applicationWillTerminate(_ application: UIApplication) {
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }

}
