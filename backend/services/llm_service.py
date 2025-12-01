import json
from typing import Dict, List, Optional
from google import genai
from google.genai import types
from config import settings
import logging
import uuid

logger = logging.getLogger(__name__)

class LLMService:
    def __init__(self):
        logger.info(f"DEBUG: GEMINI_API_KEY loaded: {settings.GEMINI_API_KEY[:4]}... (len={len(settings.GEMINI_API_KEY)})")
        
        # Initialize Google GenAI Client
        if settings.GEMINI_API_KEY:
            self.client = genai.Client(api_key=settings.GEMINI_API_KEY, http_options={'api_version': 'v1alpha'})
        else:
            self.client = None
            logger.warning("GEMINI_API_KEY is missing. LLM features will be disabled.")

        self.model = "gemini-2.0-flash-exp" # Using a modern model compatible with v1alpha/genai sdk
        
        self.system_prompt_template = """
        You are an expert Tennis Coach named "Carlitos Coach". (Session: {session_id})
        Your goal is to analyze biomechanical data from tennis players and provide actionable, encouraging, and technical feedback.
        
        You will receive JSON data containing:
        - Stroke type (Forehand, Backhand, Serve, etc.)
        - Player level (Beginner, Intermediate, Advanced)
        - Key biomechanical metrics (angles, velocities)
        - Identified phases of the stroke
        
        Your output must be a JSON object with the following structure:
        {{
            "strengths": ["List of 1-3 things the player did well"],
            "weaknesses": ["List of 1-3 major issues detected"],
            "tips": ["List of 1-3 actionable tips to correct the issues"],
            "focus_area": "One specific area to focus on (e.g., 'Racket Preparation', 'Knee Bend')"
        }}
        
        Keep your tone professional, encouraging, and concise. Use tennis terminology correctly.
        """

    async def generate_feedback(self, analysis_data: Dict, available_drills: List[Dict] = []) -> Dict:
        """
        Generates feedback based on analysis data using the LLM.
        """
        if not self.client:
            return {
                "strengths": ["LLM API Key not configured"],
                "weaknesses": [],
                "tips": ["Please configure GEMINI_API_KEY in backend settings."],
                "focus_area": "Configuration",
                "recommended_drills": []
            }

        try:
            # Construct the user message with the analysis data and available drills
            drills_context = ""
            if available_drills:
                drills_list = "\n".join([f"- {d['title']} (ID: {d['id']}, Focus: {d['focus_area']})" for d in available_drills])
                drills_context = f"""
                Available Drills in Knowledge Base:
                {drills_list}
                
                Based on the analysis, recommend 1-2 specific drills from this list if relevant. 
                Include the exact ID of the recommended drills in the 'recommended_drills' list in your JSON output.
                """

            user_message = f"""
            Analyze this tennis stroke:
            Stroke: {analysis_data.get('stroke_type', 'Unknown')}
            Metrics: {json.dumps(analysis_data.get('metrics', {}), indent=2)}
            
            {drills_context}
            """
            
            # Format system prompt
            system_prompt = self.system_prompt_template.format(session_id=str(uuid.uuid4())) + """
            Your output must be a JSON object with the following structure:
            {
                "strengths": ["List of 1-3 things the player did well"],
                "weaknesses": ["List of 1-3 major issues detected"],
                "tips": ["List of 1-3 actionable tips to correct the issues"],
                "focus_area": "One specific area to focus on",
                "recommended_drills": ["List of Drill IDs (UUIDs) from the available list"]
            }
            """

            logger.info("Sending feedback generation request to Google GenAI...")
            
            response = self.client.models.generate_content(
                model=self.model,
                contents=[
                    types.Content(
                        role="user",
                        parts=[
                            types.Part(text=system_prompt),
                            types.Part(text=user_message)
                        ]
                    )
                ],
                config=types.GenerateContentConfig(
                    response_mime_type="application/json"
                )
            )

            content = response.text
            logger.info(f"DEBUG: Raw LLM response: {content}")
            
            return json.loads(content)

        except Exception as e:
            import traceback
            logger.error(f"LLM Generation Error: {e}")
            logger.error(f"Traceback: {traceback.format_exc()}")
            return {
                "strengths": [],
                "weaknesses": ["Error generating feedback"],
                "tips": ["Please try again later."],
                "focus_area": "System Error",
                "recommended_drills": []
            }

    async def generate_chat_response(self, messages: List[Dict]) -> str:
        """
        Generates a chat response based on message history.
        """
        if not self.client:
            return "Je ne suis pas correctement configuré (Clé API manquante)."

        try:
            logger.info("Sending chat request to Google GenAI...")
            
            # Convert message history to Google GenAI format
            genai_messages = []
            
            # Add system prompt as the first user message (or system instruction if supported, but simpler to prepend)
            system_prompt = self.system_prompt_template.format(session_id=str(uuid.uuid4()))
            
            # We need to construct the history. Google GenAI expects a list of Content objects.
            # We'll prepend the system prompt to the first message or send it as a separate turn if needed.
            # For simplicity, we'll use the 'system_instruction' parameter if available, or just prepend context.
            
            # Using system_instruction in config is cleaner for v1alpha
            config = types.GenerateContentConfig(
                system_instruction=system_prompt
            )
            
            for msg in messages:
                role = "user" if msg["role"] == "user" else "model"
                # Skip system messages in the history list as we handle it via config or context
                if msg["role"] == "system":
                    continue
                    
                genai_messages.append(types.Content(
                    role=role,
                    parts=[types.Part(text=msg["content"])]
                ))

            response = self.client.models.generate_content(
                model=self.model,
                contents=genai_messages,
                config=config
            )
            
            print(f"DEBUG: Full LLM Response: {response}")
            return response.text

        except Exception as e:
            import traceback
            logger.error(f"Chat LLM Error: {e}")
            logger.error(f"Traceback: {traceback.format_exc()}")
            return "Désolé, je rencontre des difficultés techniques. Veuillez réessayer plus tard."

llm_service = LLMService()
