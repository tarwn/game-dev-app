using GDB.Common.Authorization;
using GDB.Common.BusinessLogic;
using GDB.Common.Context;
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
        //private TemporaryBusinessModelStore _store;
        private BusinessModelProcessor _processor;
        private IPersistence _persistence;

        public BusinessModelService(IBusinessServiceOperator busOp, BusinessModelProcessor processor, IPersistence persistence)
        {
            _busOp = busOp;
            _processor = processor;
            _persistence = persistence;
        }

        public async Task<BusinessModelDTO> GetOrCreateAsync(string gameId, IAuthContext authContext)
        {
            var actualGameId = CheckAndExtractGameId(gameId, authContext);

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

                var createEvent = _processor.GetCreateBusinessModelEvent(gameId);
                await _processor.AddAndApplyEventAsync(authContext.StudioId, actualGameId, gameId, createEvent);

                return await _processor.GetByIdAsync(authContext.StudioId, actualGameId, gameId);
            });
        }


        public async Task<List<BusinessModelChangeEvent>> GetSinceAsync(string gameId, int sinceVersionNumber, IAuthContext authContext)
        {
            return await _busOp.Query(async (p) =>
            {
                var actualGameId = CheckAndExtractGameId(gameId, authContext);
                return await _persistence.EventStore.GetEventsAsync(authContext.StudioId, actualGameId, BusinessModelEventApplier.ObjectType, sinceVersionNumber);
            });
        }


        public async Task<Applied<BusinessModelChangeEvent>> ApplyEventAsync(string gameId, IncomingBusinessModelChangeEvent change, IAuthContext authContext)
        {
            return await _busOp.Operation(async (p) =>
            {
                var actualGameId = CheckAndExtractGameId(gameId, authContext);
                var versionedChange = new BusinessModelChangeEvent(default, change);
                var applied = await _processor.AddAndApplyEventAsync(authContext.StudioId, actualGameId, gameId, versionedChange);
                await _persistence.Actors.UpdateActorAsync(change.Actor, change.SeqNo + change.Operations.Count, authContext.UserId, DateTime.UtcNow);
                return applied;
            });
        }

        private int CheckAndExtractGameId(string gameId, IAuthContext authContext)
        {
            if (!gameId.StartsWith($"{authContext.StudioId}:"))
            {
                throw new AccessDeniedException("Specified game does not exist or is not accessible by this studio", $"Access Denied: User {authContext.UserId} attempted to access game {gameId} while logged in for studio {authContext.StudioId}");
            }

            if (!int.TryParse(gameId.Split(":")[1], out var actualGameId))
            {
                throw new AccessDeniedException("Specified game does not exist or is not accessible by this studio", $"Invalid Game Id: User {authContext.UserId} attempted to access game {gameId} while logged in for studio {authContext.StudioId}");
            }

            return actualGameId;
        }
    }
}
