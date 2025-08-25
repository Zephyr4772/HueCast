import React from 'react';
import { Heart, Shield, Globe, Users, TrendingUp, AlertTriangle } from 'lucide-react';
import { AQI_LEVELS } from '../utils/aqiLevels';

const About: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      {/* Hero Section */}
      <div className="text-center max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Understanding Air Quality Index (AQI)
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed">
          The Air Quality Index is a standardized way to communicate air pollution levels to the public. 
          Learn how AQI works and what it means for your health and daily activities.
        </p>
      </div>

      {/* What is AQI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">What is AQI?</h2>
          </div>
          <p className="text-gray-600 leading-relaxed mb-4">
            The Air Quality Index (AQI) is a numerical scale used to communicate how polluted the air currently is 
            or how polluted it is forecast to become. AQI values range from 0 to 500, where higher values indicate 
            greater air pollution and higher health risks.
          </p>
          <p className="text-gray-600 leading-relaxed">
            AQI is calculated based on five major air pollutants: ground-level ozone, particulate matter (PM2.5 and PM10), 
            carbon monoxide, sulfur dioxide, and nitrogen dioxide.
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-green-100 rounded-lg">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Why AQI Matters</h2>
          </div>
          <ul className="text-gray-600 space-y-3">
            <li className="flex items-start space-x-2">
              <Heart className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <span>Protects public health by providing early warning of poor air quality</span>
            </li>
            <li className="flex items-start space-x-2">
              <Users className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <span>Helps sensitive groups take necessary precautions</span>
            </li>
            <li className="flex items-start space-x-2">
              <Globe className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Enables informed decisions about outdoor activities</span>
            </li>
          </ul>
        </div>
      </div>

      {/* AQI Levels Detailed */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900">AQI Levels Explained</h2>
          <p className="text-gray-600 mt-2">
            Each AQI level corresponds to different health implications and recommended actions.
          </p>
        </div>
        <div className="p-8">
          <div className="space-y-6">
            {AQI_LEVELS.map((level, index) => (
              <div key={index} className={`${level.bgColor} rounded-xl p-6 border-2`}>
                <div className="flex items-start space-x-4">
                  <span className="text-2xl">{level.emoji}</span>
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                      <h3 className={`text-xl font-bold ${level.color}`}>
                        {level.level}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${level.color} bg-white bg-opacity-50`}>
                        {level.min}-{level.max === 999 ? '500+' : level.max}
                      </span>
                    </div>
                    <p className={`${level.color} mb-3 font-medium`}>
                      {level.description}
                    </p>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {level.healthAdvice}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pollutants Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="px-8 py-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900">Key Air Pollutants</h2>
          <p className="text-gray-600 mt-2">
            Understanding the main pollutants that affect air quality and your health.
          </p>
        </div>
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: 'PM2.5',
                fullName: 'Fine Particulate Matter',
                description: 'Tiny particles less than 2.5 micrometers in diameter. Can penetrate deep into lungs and bloodstream.',
                sources: 'Vehicle emissions, industrial processes, wildfires',
                health: 'Respiratory and cardiovascular problems'
              },
              {
                name: 'PM10',
                fullName: 'Coarse Particulate Matter',
                description: 'Particles less than 10 micrometers in diameter. Larger than PM2.5 but still harmful.',
                sources: 'Dust, construction, agriculture, unpaved roads',
                health: 'Lung irritation, breathing difficulties'
              },
              {
                name: 'O₃',
                fullName: 'Ground-level Ozone',
                description: 'Secondary pollutant formed when other pollutants react with sunlight.',
                sources: 'Vehicle exhaust, industrial emissions, chemical solvents',
                health: 'Chest pain, coughing, throat irritation'
              },
              {
                name: 'NO₂',
                fullName: 'Nitrogen Dioxide',
                description: 'Reddish-brown gas that contributes to smog formation.',
                sources: 'Cars, trucks, buses, power plants',
                health: 'Respiratory infections, reduced lung function'
              },
              {
                name: 'SO₂',
                fullName: 'Sulfur Dioxide',
                description: 'Colorless gas with a strong odor, major contributor to acid rain.',
                sources: 'Coal and oil burning, metal smelting',
                health: 'Breathing problems, eye irritation'
              },
              {
                name: 'CO',
                fullName: 'Carbon Monoxide',
                description: 'Colorless, odorless gas that reduces oxygen delivery to organs.',
                sources: 'Vehicle exhaust, poorly maintained heating systems',
                health: 'Reduced oxygen in blood, heart problems'
              }
            ].map((pollutant, index) => (
              <div key={index} className="border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {pollutant.name}
                </h3>
                <p className="text-sm font-medium text-gray-700 mb-3">
                  {pollutant.fullName}
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  {pollutant.description}
                </p>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Sources:</span>
                    <p className="text-gray-600">{pollutant.sources}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Health Effects:</span>
                    <p className="text-gray-600">{pollutant.health}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Protection Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-lg border border-gray-100">
        <div className="px-8 py-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">How to Protect Yourself</h2>
          </div>
        </div>
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">When AQI is Unhealthy</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Limit outdoor activities, especially strenuous exercise</li>
                <li>• Keep windows closed and use air conditioning</li>
                <li>• Use air purifiers with HEPA filters indoors</li>
                <li>• Wear N95 masks when going outside</li>
                <li>• Stay hydrated and avoid smoking</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Sensitive Groups</h3>
              <p className="text-gray-700 mb-3">
                The following groups should be extra cautious during poor air quality days:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li>• Children and elderly individuals</li>
                <li>• People with asthma or respiratory conditions</li>
                <li>• Individuals with heart disease</li>
                <li>• Pregnant women</li>
                <li>• People who exercise outdoors regularly</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Data Sources */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Data Sources</h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          AirWatch aggregates real-time air quality data from trusted sources worldwide, 
          ensuring you get accurate and up-to-date information for informed decisions.
        </p>
        <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
          <div>World Air Quality Index Project</div>
          <div>•</div>
          <div>EPA Standards</div>
          <div>•</div>
          <div>WHO Guidelines</div>
          <div>•</div>
          <div>Local Monitoring Stations</div>
        </div>
      </div>
    </div>
  );
};

export default About;