using GDB.Business.BusinessLogic._Generic;
using GDB.Common.Authorization;
using GDB.Common.BusinessLogic;
using GDB.Common.Context;
using GDB.Common.DTOs._Events;
using GDB.Common.DTOs.BusinessModel;
using GDB.Common.Persistence;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace GDB.Business.BusinessLogic.BusinessModelService
{
    public class BusinessModelService : IBusinessModelService
    {
        private IBusinessServiceOperator _busOp;
        private EventProcessor<BusinessModelDTO, BusinessModelEventApplier> _processor;
        private IPersistence _persistence;

        public BusinessModelService(IBusinessServiceOperator busOp, EventProcessor<BusinessModelDTO, BusinessModelEventApplier> processor, IPersistence persistence)
        {
            _busOp = busOp;
            _processor = processor;
            _persistence = persistence;
        }

        public async Task<BusinessModelDTO> GetOrCreateAsync(string gameId, IAuthContext authContext)
        {
            var actualGameId = IdHelper.CheckAndExtractGameId(gameId, authContext);

            return await _busOp.Query(async (p) =>
            {
                var state = await _processor.GetByIdAsync(authContext.StudioId, actualGameId, gameId);
                if (state != null)
                {
                    return state;
                }

                var game = await _persistence.Games.GetByIdAsync(authContext.StudioId, actualGameId);
                if (game == null)
                {
                    throw new AccessDeniedException("Specified game does not exist or is not accessible by this studio", $"NonExistent Game Id: User {authContext.UserId} attempted to access game {gameId} while logged in for studio {authContext.StudioId}");
                }

                var createEvent = _processor.GetCreateEvent(gameId);
                await _processor.AddAndApplyEventAsync(authContext.StudioId, actualGameId, gameId, createEvent);
                await _persistence.Games.RegisterBusinessModuleUpdateAsync(authContext.StudioId, actualGameId, authContext.UserId, DateTime.UtcNow);

                return await _processor.GetByIdAsync(authContext.StudioId, actualGameId, gameId);
            });
        }


        public async Task<List<ChangeEvent>> GetSinceAsync(string gameId, int sinceVersionNumber, IAuthContext authContext)
        {
            return await _busOp.Query(async (p) =>
            {
                var actualGameId = IdHelper.CheckAndExtractGameId(gameId, authContext);
                return await _persistence.EventStore.GetEventsAsync(authContext.StudioId, actualGameId, _processor.ObjectType, sinceVersionNumber);
            });
        }


        public async Task<Applied<ChangeEvent>> ApplyEventAsync(string gameId, IncomingChangeEvent change, IAuthContext authContext)
        {
            return await _busOp.Operation(async (p) =>
            {
                var actualGameId = IdHelper.CheckAndExtractGameId(gameId, authContext);
                var versionedChange = new ChangeEvent(default, change);
                var applied = await _processor.AddAndApplyEventAsync(authContext.StudioId, actualGameId, gameId, versionedChange);
                await _persistence.Actors.UpdateActorAsync(change.Actor, change.SeqNo + change.Operations.Count, authContext.UserId, DateTime.UtcNow);
                await _persistence.Games.RegisterBusinessModuleUpdateAsync(authContext.StudioId, actualGameId, authContext.UserId, DateTime.UtcNow);
                return applied;
            });
        }
    }
}
