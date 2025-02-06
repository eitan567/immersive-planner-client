interface McpToolResult {
  content: Array<{
    type: string;
    text: string;
  }>;
}

interface McpToolOptions {
  serverName: string;
  toolName: string;
  arguments: Record<string, unknown>;
}

// עדכון הפורט ל-8000
const MCP_ENDPOINT = 'http://localhost:8000/mcp';

export async function useMcpTool<T = McpToolResult>(
  options: McpToolOptions
): Promise<T | { error: string }> {
  try {
    const requestBody = {
      jsonrpc: '2.0',
      method: 'call_tool',
      params: {
        server_name: options.serverName,
        name: options.toolName,
        arguments: options.arguments
      },
      id: Date.now()
    };

    const response = await fetch(MCP_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    const result = await response.json();
    
    // Handle both 200 and error responses that are JSON
    if (!response.ok) {
      return {
        error: result.error?.message || 'Server error occurred'
      };
    }
    
    // Check for JSON-RPC error
    if (result.error) {
      return {
        error: result.error.message || 'Unknown error occurred'
      };
    }

    // If we have a result but missing content, return structured error
    if (!result.result || !Array.isArray(result.result.content)) {
      return {
        error: 'Invalid response format from server'
      };
    }

    return result.result as T;
  } catch (error) {
    console.error('MCP tool error:', error);
    return { 
      error: error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred'
    };
  }
}