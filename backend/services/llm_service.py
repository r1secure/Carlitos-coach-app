import json
import logging
from typing import Dict, List, Optional, Any
from litellm import completion
from config import settings

logger = logging.getLogger(__name__)

class LLMService:
    def __init__(self):
        self.provider = settings.LLM_PROVIDER
        self.model = settings.LLM_MODEL
        
        # Handle different providers
        if self.provider == "ollama":
            self.api_base = settings.OLLAMA_API_BASE
            self.api_key = None
        else:
            # Generic LiteLLM / OpenAI compatible
            self.api_base = settings.LITELLM_API_BASE
            self.api_key = settings.LITELLM_API_KEY
        
        logger.info(f"LLM Service initialized with provider: {self.provider}, model: {self.model}")
        if self.api_base:
             logger.info(f"API Base: {self.api_base}")

    async def generate_feedback(self, analysis_data: Dict[str, Any], available_drills: List[Dict[str, str]] = []) -> Dict[str, Any]:
        """
        Generates feedback based on the analysis data using the configured LLM.
        """
        try:
            # Format available drills for the prompt
            drills_text = "\n".join([f"- {d['title']} (ID: {d['id']}): {d.get('focus_area', '')}" for d in available_drills])
            
            # Construct a prompt based on the analysis data
            system_prompt = f"""You are an expert tennis coach. 
            Analyze the following biomechanical data from a tennis shot and provide constructive feedback.
            Focus on key mechanics like body rotation, arm angles, and timing.
            
            Available Drills:
            {drills_text}
            
            Provide specific drills to improve, selecting from the available drills list if relevant.
            Format your response as a JSON object with the following keys:
            - "focus_area": The main technical aspect to focus on (e.g. "Ball Toss", "Knee Bend").
            - "strengths": A list of things done well.
            - "weaknesses": A list of areas for improvement.
            - "tips": A list of actionable advice or cues.
            - "recommended_drills": A list of drill IDs (e.g. ["drill-id-1", "drill-id-2"]).
            """
            
            user_message = f"Analysis Data: {json.dumps(analysis_data, indent=2)}"

            logger.info(f"Sending request to LLM ({self.model})...")
            
            response = completion(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message}
                ],
                api_base=self.api_base,
                api_key=self.api_key,
                custom_llm_provider=self.provider,
                response_format={ "type": "json_object" }
            )

            # Extract the JSON response
            try:
                content = response.choices[0].message.content
                feedback = json.loads(content)
                
                # Unwrap 'data' key if present (some models wrap the response)
                if "data" in feedback and isinstance(feedback["data"], dict):
                    feedback = feedback["data"]
                    
                return feedback
            except json.JSONDecodeError:
                logger.error(f"Failed to parse LLM response as JSON: {content}")
                return {
                    "summary": "Error parsing AI feedback.",
                    "strengths": [],
                    "improvements": [],
                    "drills": []
                }
            except Exception as e:
                logger.error(f"Error processing LLM response: {e}")
                return {
                    "summary": "Error processing AI feedback.",
                    "strengths": [],
                    "improvements": [],
                    "drills": []
                }

        except Exception as e:
            logger.error(f"Error generating feedback: {e}")
            return {
                "summary": "Unable to generate feedback at this time.",
                "strengths": [],
                "improvements": [],
                "drills": []
            }

    async def generate_chat_response(self, message: str, history: List[Dict[str, str]]) -> str:
        """
        Generates a response to a chat message, considering the chat history.
        """
        try:
            system_prompt = "You are a helpful and encouraging tennis coach. Answer questions about tennis technique, strategy, and training."
            
            messages = [{"role": "system", "content": system_prompt}]
            
            # Add history
            for msg in history:
                role = "user" if msg["role"] == "user" else "assistant"
                messages.append({"role": role, "content": msg["content"]})
            
            # Add current message
            messages.append({"role": "user", "content": message})

            response = completion(
                model=self.model,
                messages=messages,
                api_base=self.api_base,
                api_key=self.api_key,
                custom_llm_provider=self.provider
            )

            return response.choices[0].message.content

        except Exception as e:
            logger.error(f"Error generating chat response: {e}")
            return "I'm sorry, I'm having trouble thinking right now. Please try again later."

llm_service = LLMService()
