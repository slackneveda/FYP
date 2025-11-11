import re
from django.conf import settings
from django.middleware.csrf import CsrfViewMiddleware


class CSRFExemptMiddleware(CsrfViewMiddleware):
    """
    Custom CSRF middleware that exempts certain URL patterns from CSRF protection
    """
    def process_view(self, request, callback, callback_args, callback_kwargs):
        # Check if the request path matches any exempt patterns
        if hasattr(settings, 'CSRF_EXEMPT_URLS'):
            for pattern in settings.CSRF_EXEMPT_URLS:
                if re.match(pattern, request.path):
                    # Set a flag to indicate this request should be exempt
                    setattr(request, '_dont_enforce_csrf_checks', True)
                    return None
        
        # For all other requests, use the default CSRF processing
        return super().process_view(request, callback, callback_args, callback_kwargs)