import React from 'react'
import Popup from '@/components/common/Popup'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Check, Copy } from 'lucide-react'
import { useState } from 'react'

const IntegrateChatbot = ({ chatbotId }: { chatbotId: string }) => {
  const [copied, setCopied] = useState(false)
  const [open, setOpen] = useState(false);

  const integrationCode = `<script>
(function() {
    // Create toggle button
    var toggleBtn = document.createElement('button');
    toggleBtn.innerHTML = '💬';
    toggleBtn.style.cssText = \`
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        border-radius: 25px;
        background: #2563eb;
        color: white;
        border: none;
        cursor: pointer;
        z-index: 10000;
        font-size: 24px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    \`;

    // Create iframe
    var iframe = document.createElement('iframe');
    iframe.src = "http://localhost:3000/chatbot/${chatbotId}";
    iframe.style.cssText = \`
        border: none;
        position: fixed;
        bottom: 80px;
        right: 20px;
        width: 380px;
        height: 600px;
        z-index: 9999;
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transition: all 0.3s ease;
        display: none;
    \`;

    // Add elements to page
    document.body.appendChild(toggleBtn);
    document.body.appendChild(iframe);

    // Handle iframe resize messages
    window.addEventListener('message', function(event) {
        if (event.data.type === 'resize') {
            if (event.data.isExpanded) {
                iframe.style.width = '600px';
                iframe.style.height = '800px';
            } else {
                iframe.style.width = '380px';
                iframe.style.height = '600px';
            }
        }
    });

    // Toggle iframe visibility
    var isVisible = false;
    toggleBtn.addEventListener('click', function() {
        if (isVisible) {
            iframe.style.display = 'none';
            toggleBtn.innerHTML = '💬';
        } else {
            iframe.style.display = 'block';
            toggleBtn.innerHTML = '✕';
        }
        isVisible = !isVisible;
    });
})();</script>`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(integrationCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000) // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <Popup
      open={open} setOpen={setOpen}
      title="Integrate Chatbot"
      triggerLabel="Integrate"
      submitLabel="Close"
    >
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Copy and paste this code snippet into your website&apos;s HTML, just before the closing &lt;/body&gt; tag:
        </p>
        <div className="relative">
          <Textarea
            value={integrationCode}
            readOnly
            className="min-h-[300px] font-mono text-sm bg-gray-300 border-dashed resize-none p-4 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-gray-400"
          />
          <Button
            size="sm"
            variant="ghost"
            className="absolute top-3 right-3 hover:bg-background/90"
            onClick={handleCopy}
          >
            {copied ? (
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-xs text-green-500">Copied!</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Copy className="h-4 w-4" />
                <span className="text-xs">Copy</span>
              </div>
            )}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          This will add the chatbot widget to your website. The chatbot will appear as a floating button in the bottom-right corner.
        </p>
      </div>
    </Popup>
  )
}

export default IntegrateChatbot