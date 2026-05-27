package com.br.usermanager.infra.logging;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.HashMap;
import java.util.Map;

@Aspect
@Component
public class LoggingAspect {

    private static final Logger log = LoggerFactory.getLogger(LoggingAspect.class);

    private final LogService logService;
    private final ObjectMapper objectMapper;

    public LoggingAspect(LogService logService, ObjectMapper objectMapper) {
        this.logService = logService;
        this.objectMapper = objectMapper;
    }

    @Around("execution(public * com.br.usermanager..controllers..*(..)) || execution(public * com.br.usermanager..services..*(..))")
    public Object aroundControllerAndService(ProceedingJoinPoint pjp) throws Throwable {

        MethodSignature ms = (MethodSignature) pjp.getSignature();
        String methodName = ms.getDeclaringType().getSimpleName() + "." + ms.getName();

        // Build payload map with parameter names and values
        Object[] args = pjp.getArgs();
        String[] paramNames = ms.getParameterNames();
        Map<String, Object> payload = new HashMap<>();
        if (paramNames != null) {
            for (int i = 0; i < paramNames.length; i++) {
                try {
                    String name = paramNames[i] != null ? paramNames[i].toLowerCase() : "";
                    Object value = args[i];
                    // Mask sensitive fields
                    if (name.contains("pass") || name.contains("senha") || name.contains("password")) {
                        payload.put(paramNames[i], "[MASKED]");
                    } else {
                        payload.put(paramNames[i], value);
                    }
                } catch (Exception e) {
                    payload.put(paramNames[i], "[unavailable]");
                }
            }
        }

        HttpServletRequest request = getCurrentHttpRequest();
        String httpMethod = request != null ? request.getMethod() : null;
        String path = request != null ? request.getRequestURI() : null;
        String principal = request != null && request.getUserPrincipal() != null ? request.getUserPrincipal().getName() : null;

        try {
            Object result = pjp.proceed();

            // Save info log
            logService.saveInfo(pjp.getSignature().getDeclaringTypeName(), methodName, payload, httpMethod, path, principal);

            return result;
        } catch (Throwable ex) {
            // Save error log with exception
            logService.saveError(pjp.getSignature().getDeclaringTypeName(), methodName, payload, ex, httpMethod, path, principal);
            throw ex;
        }
    }

    private HttpServletRequest getCurrentHttpRequest() {
        RequestAttributes attrs = RequestContextHolder.getRequestAttributes();
        if (attrs instanceof ServletRequestAttributes) {
            return ((ServletRequestAttributes) attrs).getRequest();
        }
        return null;
    }
}

